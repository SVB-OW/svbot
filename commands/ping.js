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
  async execute(msg, args, mongoSignups, mongoLobbies) {
    // Validate
    const pingsChannel = await msg.guild.channels.cache.find(
      c => c.name === 'player-pings',
    );
    if (!pingsChannel)
      throw new ClientError('Channel player-pings does not exist');
    // Checks Rank
    if (!args[0] || !rankRegex.test(args[0]))
      throw new ClientError('Rank is invalid ' + args[0]);
    // Checks Region
    if (!args[1] || !regionRegex.test(args[1]))
      throw new ClientError('Region is invalid ' + args[1]);
    // Checks Streamer
    if (!args[2]) throw new ClientError('Streamer cannot be empty ' + args[2]);

    let lobby = {};
    lobby.rank = args[0].toUpperCase();
    lobby.region = args[1].toUpperCase();
    lobby.streamer = args[2];

    const roleByName = msg.guild.roles.cache.find(
      item => item.name.toUpperCase() === lobby.rank,
    );
    if (!roleByName) throw new ClientError(`Role ${lobby.rank} does not exist`);
    lobby.pingMsg = await pingsChannel.send(
      `${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`,
    );

    await lobby.pingMsg.react('👍');

    lobby.pingMsg = { id: lobby.pingMsg.id };
    lobby.pingOccured = new Date().toISOString();
    lobby.announced = false;
    lobby.cleared = false;
    await mongoLobbies.insertOne(lobby);
  },
};
