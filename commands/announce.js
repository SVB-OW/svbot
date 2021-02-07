const { MessageEmbed } = require('discord.js');
const { ClientError } = require('../types');

module.exports = {
  name: 'announce',
  description: 'Post player list in #matchmaker',
  allowedChannels: ['bot-commands'],
  props: [
    { name: 'tankPlayersCount', required: false },
    { name: 'dpsPlayersCount', required: false },
    { name: 'supportPlayersCount', required: false },
  ],
  async execute(msg, args, db, mongoSignups, mongoLobbies) {
    // Validate
    if ((await mongoLobbies.countDocuments()) === 0)
      throw new ClientError('No ping has occured yet');

    const tankCount = args[0] ? Number.parseInt(args[0]) : 4;
    const dpsCount = args[1] ? Number.parseInt(args[1]) : 4;
    const suppCount = args[2] ? Number.parseInt(args[2]) : 4;

    // Fetch ping msg
    let lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } });
    lobby.tankPlayers = [];
    lobby.damagePlayers = [];
    lobby.supportPlayers = [];

    lobby.pingMsg = await msg.guild.channels.cache
      .find(c => c.name === 'player-pings')
      .messages.fetch(lobby.pingMsg.id);

    // List of players who reacted to ping message
    let msgReactionUsers = (
      await lobby.pingMsg.reactions.cache
        .filter(mr => mr.emoji.name === '👍')
        .first()
        .users.fetch()
    ).filter(user => !user.bot);

    let guildMembers = await msg.guild.members.fetch({ force: true });

    // Iterate list of users who reacted
    for (const [userId, user] of msgReactionUsers) {
      // Find singup for current user
      let findSignup = await mongoSignups.findOne({ discordId: userId });

      // Check that signup exists, was confirmed and the user is still in the server
      if (
        findSignup &&
        findSignup.confirmedOn &&
        guildMembers.get(findSignup.discordId)
      ) {
        // Sort roles by which has the least players already
        let rolePools = [
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

    let top4tanks = lobby.tankPlayers.slice(0, tankCount);
    let top4damages = lobby.damagePlayers.slice(0, dpsCount);
    let top4supports = lobby.supportPlayers.slice(0, suppCount);

    let ingameRole = msg.guild.roles.cache.find(r => r.name === 'Ingame');

    top4tanks.forEach(s => {
      guildMembers.get(s.discordId).roles.add(ingameRole);
    });

    top4damages.forEach(s => {
      guildMembers.get(s.discordId).roles.add(ingameRole);
    });

    top4supports.forEach(s => {
      guildMembers.get(s.discordId).roles.add(ingameRole);
    });

    let lobbyHostRole = msg.guild.roles.cache.find(
      r => r.name === 'Lobby Host',
    );
    const btagEmbed = new MessageEmbed()
      .setTitle('Lobby')
      .setDescription(`<@&${lobbyHostRole.id}>`)
      .setTimestamp()
      .addFields(
        {
          name: 'Tank Players',
          value: `${top4tanks.map(p => p.battleTag).join(', ') || 'none'}`,
        },
        {
          name: 'Damage Players',
          value: `${top4damages.map(p => p.battleTag).join(', ') || 'none'}`,
        },
        {
          name: 'Support Players',
          value: `${top4supports.map(p => p.battleTag).join(', ') || 'none'}`,
        },
      );

    // TODO: add message for players to join messages
    const playerMessage = `**Lobby**
      *Tank*
      ${top4tanks.map(p => `<@${p.discordId}>`).join(', ') || 'none'}
      *Damage*
      ${top4damages.map(p => `<@${p.discordId}>`).join(', ') || 'none'}
      *Support*
      ${top4supports.map(p => `<@${p.discordId}>`).join(', ') || 'none'}
      `;

    await msg.guild.channels.cache
      .find(c => c.name === 'matchmaker')
      .send(btagEmbed);
    await msg.guild.channels.cache
      .find(c => c.name === 'player-pings')
      .send(playerMessage);

    lobby.pingMsg = { id: lobby.pingMsg.id };
    lobby.announced = true;
    mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby });
  },
};
