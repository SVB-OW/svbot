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
  async execute(msg, args, mongoSignups, mongoLobbies) {
    //#region Validations
    if ((await mongoLobbies.countDocuments()) === 0)
      throw new ClientError('No ping has occurred yet');

    let ingameRole = msg.guild.roles.cache.find(r => r.name === 'Ingame');
    if (!ingameRole) throw new ClientError('Ingame role does not exist');
    let hostRole = msg.guild.roles.cache.find(r => r.name === 'Lobby Host');
    if (!hostRole) throw new ClientError('Lobby Host role does not exist');

    const mmChannel = msg.guild.channels.cache.find(
      c => c.name === 'matchmaker',
    );
    if (!mmChannel) throw new ClientError('Channel matchmaker does not exist');
    const pingsChannel = msg.guild.channels.cache.find(
      c => c.name === 'player-pings',
    );
    if (!pingsChannel)
      throw new ClientError('Channel player-pings does not exist');
    //#endregion

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
    for (const [userId] of msgReactionUsers) {
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

    top4tanks.forEach(s => {
      guildMembers.get(s.discordId).roles.add(ingameRole);
      mongoSignups.updateOne(
        { discordId: s.discordId },
        { $inc: { gamesPlayed: 1 } },
      );
    });

    top4damages.forEach(s => {
      guildMembers.get(s.discordId).roles.add(ingameRole);
      mongoSignups.updateOne(
        { discordId: s.discordId },
        { $inc: { gamesPlayed: 1 } },
      );
    });

    top4supports.forEach(s => {
      guildMembers.get(s.discordId).roles.add(ingameRole);
      mongoSignups.updateOne(
        { discordId: s.discordId },
        { $inc: { gamesPlayed: 1 } },
      );
    });

    const btagMessage = `**Next lobby <@&${hostRole.id}>**
*Tank*
${top4tanks.map(p => p.battleTag).join(', ') || 'none'}
*Damage*
${top4damages.map(p => p.battleTag).join(', ') || 'none'}
*Support*
${top4supports.map(p => p.battleTag).join(', ') || 'none'}
`;

    const playerMessage = `**Lobby Announcement**
Following players have been selected for the next game.
If you are listed below, please join the Waiting Lobby voice channel, start the game on the right region and join the custom game.

*Tank*
${top4tanks.map(p => `<@${p.discordId}>`).join(', ') || 'none'}

*Damage*
${top4damages.map(p => `<@${p.discordId}>`).join(', ') || 'none'}

*Support*
${top4supports.map(p => `<@${p.discordId}>`).join(', ') || 'none'}
`;

    mmChannel.send(btagMessage);
    pingsChannel.send(playerMessage);

    lobby.pingMsg = { id: lobby.pingMsg.id };
    lobby.announced = true;
    mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby });
  },
};
