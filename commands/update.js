const { MessageEmbed } = require('discord.js');
const { ClientError, Signup } = require('../types');

module.exports = {
  name: 'update',
  description: 'Updates a property of one or more users',
  props: [
    { name: 'property', required: true },
    { name: 'value', required: true },
    { name: 'discordIds', required: true },
  ],
  allowedRoles: ['Admin'],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    if (args.length < 3)
      throw new ClientError(
        'Too few arguments. Format is !update <key> <value> <discordId...>',
      );

    if (!new Signup().hasOwnProperty(args[0]))
      throw new ClientError('Key does not exist');

    let userIds = args.slice(2);

    userIds.forEach(id => {
      let foundUser = mongoSignups.findOne({ discordId: id });
      if (!foundUser) throw new ClientError(`Signup for ${id} was not found`);

      if (args[0] in foundUser) {
        foundUser[args[0]] = args[1];
        mongoSignups.updateOne({ discordId: id }, { $set: foundUser });
      }

      msg.channel.send(
        new MessageEmbed()
          .setTitle('Updated signup')
          .setTimestamp()
          .addFields(
            Object.keys(foundUser).map(key => ({
              name: key,
              value: foundUser[key] ?? '-',
            })),
          ),
      );
    });
  },
};
