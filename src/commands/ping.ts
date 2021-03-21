import { Command, ClientError, Lobby, Rank, Region } from '../types';
import { rankRegex, regionRegex } from '../config';
import { TextChannel } from 'discord.js';

module.exports = new Command({
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
    const pingsChannel = (await msg.guild.channels.cache.find(
      c => c.name === 'player-pings',
    )) as TextChannel;
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

    let lobby = new Lobby();
    lobby.rank = args[0].toUpperCase() as Rank;
    lobby.region = args[1].toUpperCase() as Region;
    lobby.streamer = args[2];

    const roleByName = msg.guild.roles.cache.find(
      item => item.name.toUpperCase() === lobby.rank,
    );
    if (!roleByName) throw new ClientError(`Role ${lobby.rank} does not exist`);
    lobby.pingMsg = await pingsChannel.send(
      `${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`,
    );

    await lobby.pingMsg.react('👍');

    lobby.pingMsgId = lobby.pingMsg.id;
    await mongoLobbies.insertOne(lobby);
  },
});
