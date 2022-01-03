import { Role, TextChannel } from 'discord.js';
import { Command, ClientError } from '../types';
import { rankResolver } from '../helpers';

module.exports = new Command({
  name: 'confirm',
  description: 'Confirms a signup entry',
  props: [
    { name: 'signupMsgId', required: true },
    { name: 'tankRank', required: true },
    { name: 'dpsRank', required: true },
    { name: 'supportRank', required: true },
  ],
  allowedChannels: ['bot-commands'],
  async execute({ msg, args, mongoSignups }) {
    if (args.length < 4)
      throw new ClientError(
        msg,
        'Invalid number of arguments. Format is "!confirm <msgId> <tankRank> <dpsRank> <supportRank>',
      );

    const signupChannel = msg.guild.channels.cache.find(
      c => c.name === 'signup',
    ) as TextChannel;
    if (!signupChannel)
      throw new ClientError(msg, 'Signup channel does not exist');

    const foundSignupByMsgId = await mongoSignups.findOne({
      signupMsgId: args[0],
    });
    if (!foundSignupByMsgId)
      throw new ClientError(msg, 'MsgId was not found in DB');

    if (!rankResolver(args[1]))
      throw new ClientError(msg, 'Tank rank is invalid');

    if (!rankResolver(args[2]))
      throw new ClientError(msg, 'Damage rank is invalid');

    if (!rankResolver(args[3]))
      throw new ClientError(msg, 'Support rank is invalid');

    foundSignupByMsgId.tankRank = rankResolver(args[1]) as string;
    foundSignupByMsgId.damageRank = rankResolver(args[2]) as string;
    foundSignupByMsgId.supportRank = rankResolver(args[3]) as string;
    foundSignupByMsgId.confirmedBy = msg.author.username;
    foundSignupByMsgId.confirmedOn = new Date(
      msg.createdTimestamp,
    ).toISOString();

    mongoSignups.updateOne(
      { signupMsgId: args[0] },
      { $set: foundSignupByMsgId },
    );

    // Assign rank roles on confirm
    const member = await msg.guild.members.fetch(foundSignupByMsgId.discordId);
    if (foundSignupByMsgId.tankRank !== '-')
      member.roles.add(
        msg.guild.roles.cache.find(
          r => r.name.toUpperCase() === foundSignupByMsgId.tankRank,
        ) as Role,
      );

    if (foundSignupByMsgId.damageRank !== '-')
      member.roles.add(
        msg.guild.roles.cache.find(
          r => r.name.toUpperCase() === foundSignupByMsgId.damageRank,
        ) as Role,
      );

    if (foundSignupByMsgId.supportRank !== '-')
      member.roles.add(
        msg.guild.roles.cache.find(
          r => r.name.toUpperCase() === foundSignupByMsgId.supportRank,
        ) as Role,
      );

    // TODO: Old messages might not be fetchable
    signupChannel.messages
      .fetch(foundSignupByMsgId.signupMsgId)
      .then(oldMsg => {
        oldMsg.react('👍');
      });

    msg.channel.send('Signup successfully validated');
  },
});
