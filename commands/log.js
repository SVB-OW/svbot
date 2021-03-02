const { MessageEmbed } = require('discord.js');
const { ClientError } = require('../types');

module.exports = {
  name: 'log',
  description:
    'Logs the first db entry or optionally a specific entry by signupId',
  props: [{ name: 'discordTag', required: false }],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    if ((await mongoSignups.countDocuments()) === 0)
      throw new ClientError('No signups yet');

    if (msg.mentions.users.size === 1) {
      let found = await mongoSignups.findOne({
        discordId: msg.mentions.users.first().id,
      });
      if (!found) throw new ClientError('Signup not found');

      await msg.channel.send(
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
      let firstSignup = await mongoSignups.findOne();

      await msg.channel.send(
        new MessageEmbed()
          .setTitle('first signup')
          .setTimestamp()
          .addFields(
            Object.keys(firstSignup).map(key => ({
              name: key,
              value: firstSignup[key] || '-',
            })),
          ),
      );
    }
  },
};
