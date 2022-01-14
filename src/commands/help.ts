import { MessageEmbed } from 'discord.js';
import { prefixLive } from '../config';
import { Command } from '../types';

module.exports = new Command({
  name: 'help',
  description:
    'Shows this help list of all commands or filtered by multiple names',
  props: [{ name: 'command', required: false }],
  allowedChannels: ['bot-commands'],
  // allowedRoles: ['Lobby Host', 'Gold', 'Admin'],
  async execute({ msg, args }) {
    const embed = new MessageEmbed().setTitle('Commands').setTimestamp();

    if (args.length) {
      for (const arg of args) {
        const command = msg.client.commands.get(arg);
        if (command) {
          const propsString = (command.props || [])
            .map(p => (p.required ? `<${p.name}>` : `<${p.name}?>`))
            .join(' ');
          embed.addField(
            '```' + prefixLive + arg + ' ' + propsString + '```',
            command.description,
          );
        }
      }
    } else {
      for (const [name, command] of msg.client.commands) {
        const propsString = (command.props || [])
          .map(p => (p.required ? `<${p.name}>` : `<${p.name}?>`))
          .join(' ');
        embed.addField(
          '```' + prefixLive + name + ' ' + propsString + '```',
          command.description +
            '\nAllowed Roles: ' +
            (command.allowedRoles.join(', ') || 'All'),
        );
      }
    }

    await msg.channel.send({ embeds: [embed] });
  },
});
