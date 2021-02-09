const { MessageEmbed } = require('discord.js');
const { prefix } = require('../config');

module.exports = {
  name: 'help',
  description:
    'Shows this help list of all commands or filtered by multiple names',
  // allowedRoles: ['Lobby Host', 'Gold', 'Admin'],
  props: [{ name: 'command', required: false }],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    const embed = new MessageEmbed().setTitle('Commands').setTimestamp();

    if (args.length) {
      for (const arg of args) {
        const command = msg.client.commands.get(arg);
        if (command) {
          let propsString = (command.props || [])
            .map(p => (p.required ? `<${p.name}>` : `<${p.name}?>`))
            .join(' ');
          embed.addField(
            '```' + prefix + (command.help || arg) + ' ' + propsString + '```',
            command.description,
          );
        }
      }
    } else {
      for (const [name, command] of msg.client.commands) {
        let propsString = (command.props || [])
          .map(p => (p.required ? `<${p.name}>` : `<${p.name}?>`))
          .join(' ');
        embed.addField(
          '```' + prefix + (command.help || name) + ' ' + propsString + '```',
          command.description +
            '\nAllowed Roles: ' +
            command.allowedRoles?.join(', '),
        );
      }
    }

    msg.channel.send(embed);
  },
};
