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
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups) {
    if (args.length < 3)
      throw new ClientError(
        'Too few arguments. Format is !update <property> <value> <discordIds...>',
      );

    if (!new Signup().hasOwnProperty(args[0]))
      throw new ClientError('Property does not exist');

    let userIds = args.slice(2);

    userIds.forEach(async id => {
      let foundUser = await mongoSignups.findOne({ discordId: id });
      if (!foundUser) throw new ClientError(`Signup for ${id} was not found`);

      if (args[0] in foundUser) {
        let newVal = args[1];
        if (['tankRank', 'damageRank', 'supportRank'].includes(args[0]))
          newVal = args[1].toUpperCase();

        foundUser[args[0]] = newVal;
        mongoSignups.updateOne({ discordId: id }, { $set: foundUser });
      }

      await msg.channel.send(
        new MessageEmbed()
          .setTitle('Updated signup')
          .setTimestamp()
          .addFields(
            Object.keys(foundUser).map(key => ({
              name: key,
              value: foundUser[key] || '-',
            })),
          ),
      );
    });
  },
};
