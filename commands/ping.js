const { ClientError } = require('../types');
const { rankRegex, regionRegex } = require('../config');

module.exports = {
  name: 'ping',
  description: 'Ping rank role with streamer and region in #player-pings',
  props: [
    { name: 'rank', required: true },
    { name: 'region', required: true },
    { name: 'streamer', required: true },
  ],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, db, mongoDb, lobby) {
    // Validate
    // Checks Rank
    if (!args[0] || !rankRegex.test(args[0]))
      throw new ClientError('Rank is invalid ' + args[0]);
    // Checks Region
    if (!args[1] || !regionRegex.test(args[1]))
      throw new ClientError('Region is invalid ' + args[1]);
    // Checks Streamer
    if (!args[2]) throw new ClientError('Streamer cannot be empty ' + args[2]);
    // Check that last match was cleared
    if (lobby.pingMsg)
      throw new ClientError('Last match must be cleared first');

    lobby.rank = args[0].toUpperCase();
    lobby.region = args[1].toUpperCase();
    lobby.streamer = args[2];

    const roleByName = msg.guild.roles.cache.find(
      item => item.name.toUpperCase() === lobby.rank,
    );
    lobby.pingMsg = await msg.guild.channels.cache
      .find(c => c.name === 'player-pings')
      .send(
        `${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`,
      );

    await lobby.pingMsg.react('👍');
  },
};
