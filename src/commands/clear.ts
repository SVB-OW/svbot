import { Role } from 'discord.js';
import { Command, ClientError } from '../types';

module.exports = new Command({
  name: 'clear',
  description:
    'Kicks all players with @Ingame from voice lobbies and removes their role',
  allowedChannels: ['bot-commands'],
  async execute({ msg, mongoLobbies }) {
    let lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } });
    if (!lobby) throw new ClientError('No lobby was announced yet');
    let role = msg.guild.roles.cache.find(
      role => role.name === 'Ingame',
    ) as Role;
    if (!role) throw new ClientError('Ingame role does not exist');

    lobby.cleared = true;
    mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby });

    let ingamePlayers = msg.guild.roles.cache.get(role.id)?.members;
    ingamePlayers?.forEach(value => {
      value.voice.setChannel(null);
      value.roles.remove(role);
    });
    msg.channel.send('Ingame role cleared');
  },
});
