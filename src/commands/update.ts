import { MessageEmbed, Role } from 'discord.js';
import { rankResolver } from '../helpers';
import { ClientError, Command, Signup } from '../types';

module.exports = new Command({
  name: 'update',
  description: 'Updates a property of one or more users',
  props: [
    { name: 'property', required: true },
    { name: 'value', required: true },
    { name: 'discordIds', required: true },
  ],
  allowedChannels: ['bot-commands'],
  async execute({ msg, args, mongoSignups }) {
    if (args.length < 3)
      throw new ClientError(
        'Too few arguments. Format is !update <property> <value> <discordIds...>',
      );

    if (!new Signup().hasOwnProperty(args[0]))
      throw new ClientError('Property does not exist');

    let userIds = args.slice(2);

    userIds.forEach(async id => {
      const foundUser = await mongoSignups.findOne({ discordId: id });
      if (!foundUser) throw new ClientError(`Signup for ${id} was not found`);

      let newVal = args[1];
      if (['tankRank', 'damageRank', 'supportRank'].includes(args[0]))
        newVal = args[1].toUpperCase();

      foundUser[args[0]] = newVal;
      mongoSignups.updateOne({ discordId: id }, { $set: foundUser });

      const member = await msg.guild.members.fetch(foundUser.discordId);

      // Remove all rank roles (doesn't work with admins)
      await member.roles.set(
        Object.values(member.roles)
          .filter((r: Role) => !rankResolver(r.name))
          .map((r: Role) => r.id),
      );

      // Assign rank roles on confirm
      if (foundUser.tankRank !== '-')
        member.roles.add(
          msg.guild.roles.cache.find(
            r => r.name.toUpperCase() === foundUser.tankRank,
          ) as Role,
        );

      if (foundUser.damageRank !== '-')
        member.roles.add(
          msg.guild.roles.cache.find(
            r => r.name.toUpperCase() === foundUser.damageRank,
          ) as Role,
        );

      if (foundUser.supportRank !== '-')
        member.roles.add(
          msg.guild.roles.cache.find(
            r => r.name.toUpperCase() === foundUser.supportRank,
          ) as Role,
        );

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
});
