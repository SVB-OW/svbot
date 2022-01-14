import { Role, TextChannel } from 'discord.js';
import { Command, ClientError } from '../types';

module.exports = new Command({
  name: 'announce',
  description: 'Post player list in #matchmaker',
  props: [
    { name: 'tankPlayersCount', required: false },
    { name: 'dpsPlayersCount', required: false },
    { name: 'supportPlayersCount', required: false },
  ],
  allowedChannels: ['bot-commands'],
  async execute({ msg, args, mongoSignups, mongoLobbies }) {
    //#region Validations
    if ((await mongoLobbies.countDocuments()) === 0)
      throw new ClientError(msg, 'No ping has occurred yet');

    const ingameRole = msg.guild.roles.cache.find(
      r => r.name === 'Ingame',
    ) as Role;
    if (!ingameRole) throw new ClientError(msg, 'Ingame role does not exist');
    const hostRole = msg.guild.roles.cache.find(
      r => r.name === 'Lobby Host',
    ) as Role;
    if (!hostRole) throw new ClientError(msg, 'Lobby Host role does not exist');

    const mmChannel = msg.guild.channels.cache.find(
      c => c.name === 'matchmaker',
    ) as TextChannel;
    if (!mmChannel)
      throw new ClientError(msg, 'Channel matchmaker does not exist');
    const pingsChannel = msg.guild.channels.cache.find(
      c => c.name === 'player-pings',
    ) as TextChannel;
    if (!pingsChannel)
      throw new ClientError(msg, 'Channel player-pings does not exist');
    //#endregion

    const tankCount = args[0] ? Number.parseInt(args[0]) : 4;
    const dpsCount = args[1] ? Number.parseInt(args[1]) : 4;
    const suppCount = args[2] ? Number.parseInt(args[2]) : 4;

    // Fetch ping msg
    const lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } });
    if (!lobby) throw new ClientError(msg, 'No lobby has been created yet');

    const pingMsg = await pingsChannel.messages.fetch(lobby.pingMsgId);
    if (!pingMsg)
      throw new ClientError(msg, 'Ping message could not be fetched');

    // Collection of players who reacted to ping message
    const msgReactionUsers =
      (
        await pingMsg.reactions.cache
          .find(mr => mr.emoji.name === '👍')
          ?.users.fetch()
      )?.filter(user => !user.bot) || [];

    const guildMembers = await msg.guild.members.fetch({ force: true });

    // Iterate list of users who reacted
    for (const [userId] of msgReactionUsers) {
      // Find singup for current user
      const findSignup = await mongoSignups.findOne({ discordId: userId });

      // Check that signup exists, was confirmed and the user is still in the server
      if (
        findSignup &&
        findSignup.confirmedOn &&
        guildMembers.get(findSignup.discordId)
      ) {
        // Sort roles by which has the least players already
        const rolePools = [
          { name: 'tank', arr: lobby.tankPlayers },
          { name: 'damage', arr: lobby.damagePlayers },
          { name: 'support', arr: lobby.supportPlayers },
        ].sort((a, b) => {
          if (a.arr.length < b.arr.length) return -1;
          if (a.arr.length > b.arr.length) return 1;

          return 0;
        });

        if (findSignup[rolePools[0].name + 'Rank'] === lobby.rank) {
          lobby[rolePools[0].name + 'Players'].push(findSignup);
          continue;
        }

        if (findSignup[rolePools[1].name + 'Rank'] === lobby.rank) {
          lobby[rolePools[1].name + 'Players'].push(findSignup);
          continue;
        }

        if (findSignup[rolePools[2].name + 'Rank'] === lobby.rank) {
          lobby[rolePools[2].name + 'Players'].push(findSignup);
          continue;
        }
      }
    }

    lobby.tankPlayers.sort((a, b) => {
      if (a.gamesPlayed > b.gamesPlayed) return 1;
      if (a.gamesPlayed < b.gamesPlayed) return -1;
      if (a.region === lobby.region && b.region !== lobby.region) return -1;
      if (b.region === lobby.region && a.region !== lobby.region) return 1;

      return 0;
    });
    lobby.damagePlayers.sort((a, b) => {
      if (a.gamesPlayed > b.gamesPlayed) return 1;
      if (a.gamesPlayed < b.gamesPlayed) return -1;
      if (a.region === lobby.region && b.region !== lobby.region) return -1;
      if (b.region === lobby.region && a.region !== lobby.region) return 1;

      return 0;
    });
    lobby.supportPlayers.sort((a, b) => {
      if (a.gamesPlayed > b.gamesPlayed) return 1;
      if (a.gamesPlayed < b.gamesPlayed) return -1;
      if (a.region === lobby.region && b.region !== lobby.region) return -1;
      if (b.region === lobby.region && a.region !== lobby.region) return 1;

      return 0;
    });

    const top4tanks = lobby.tankPlayers.slice(0, tankCount);
    const top4damages = lobby.damagePlayers.slice(0, dpsCount);
    const top4supports = lobby.supportPlayers.slice(0, suppCount);

    top4tanks.forEach(s => {
      guildMembers.get(s.discordId)?.roles.add(ingameRole);
      mongoSignups.updateOne(
        { discordId: s.discordId },
        { $inc: { gamesPlayed: 1 } },
      );
    });

    top4damages.forEach(s => {
      guildMembers.get(s.discordId)?.roles.add(ingameRole);
      mongoSignups.updateOne(
        { discordId: s.discordId },
        { $inc: { gamesPlayed: 1 } },
      );
    });

    top4supports.forEach(s => {
      guildMembers.get(s.discordId)?.roles.add(ingameRole);
      mongoSignups.updateOne(
        { discordId: s.discordId },
        { $inc: { gamesPlayed: 1 } },
      );
    });

    const btagMessage = `**Next lobby <@&${hostRole.id}>**
*Tank*
${top4tanks.map(p => p.battconstag).join(', ') || 'none'}
*Damage*
${top4damages.map(p => p.battconstag).join(', ') || 'none'}
*Support*
${top4supports.map(p => p.battconstag).join(', ') || 'none'}
`;

    const playerMessage = `**Lobby Announcement**
The following players have been selected for the next game.
If you are listed below, please join the Waiting Lobby voice channel, start the game on the right region and wait for an invite to the custom game lobby.

*Tank*
${top4tanks.map(p => `<@${p.discordId}>`).join(', ') || 'none'}

*Damage*
${top4damages.map(p => `<@${p.discordId}>`).join(', ') || 'none'}

*Support*
${top4supports.map(p => `<@${p.discordId}>`).join(', ') || 'none'}
`;

    mmChannel.send(btagMessage);
    pingsChannel.send(playerMessage);

    lobby.pingAnnounced = true;
    mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby });
  },
});
