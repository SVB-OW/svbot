const { MessageEmbed } = require('discord.js');
const { ClientError } = require('../types');

module.exports = {
  name: 'log',
  description:
    'Logs the first db entry or optionally a specific entry by signupId',
  props: [{ name: 'discordTag', required: false }],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, db, mongoDb, lobby) {
    if (db.signups.length === 0) throw new ClientError('No signups yet');
    if (msg.mentions.users.size === 1) {
      let found = db.signups.find(
        item => item.discordId === msg.mentions.users.first().id,
      );
      if (!found) throw new ClientError('Signup not found');

      msg.channel.send(
        new MessageEmbed()
          .setTitle(args[0])
          .setTimestamp()
          .addFields(
            Object.keys(found).map(key => ({
              name: key,
              value: found[key] ?? '-',
            })),
          ),
      );
    } else {
      msg.channel.send(
        new MessageEmbed()
          .setTitle('db.signups[0]')
          .setTimestamp()
          .addFields(
            Object.keys(db.signups[0]).map(key => ({
              name: key,
              value: db.signups[0][key] || '-',
            })),
          ),
      );
    }
  },
};
