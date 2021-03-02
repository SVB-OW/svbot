const { MessageEmbed } = require('discord.js');
const { prefixLive } = require('../config');

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
            '```' +
              prefixLive +
              (command.help || arg) +
              ' ' +
              propsString +
              '```',
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
          '```' +
            prefixLive +
            (command.help || name) +
            ' ' +
            propsString +
            '```',
          command.description +
            '\nAllowed Roles: ' +
            command.allowedRoles?.join(', '),
        );
      }
    }

    await msg.channel.send(embed);
  },
};
