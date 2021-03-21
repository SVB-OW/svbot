import { Role, TextChannel } from 'discord.js';
import { Command, ClientError } from '../types';
import { rankRegex } from '../config';

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
        'Invalid number of arguments. Format is ".confirm <msgId> <tankRank> <dpsRank> <supportRank>',
      );

    const signupChannel = msg.guild.channels.cache.find(
      c => c.name === 'signup',
    ) as TextChannel;
    if (!signupChannel) throw new ClientError('Signup channel does not exist');

    const foundSignupByMsgId = await mongoSignups.findOne({
      signupMsgId: args[0],
    });
    if (!foundSignupByMsgId) throw new ClientError('MsgId was not found in DB');

    if (!rankRegex.test(args[1])) throw new ClientError('Tank rank is invalid');

    if (!rankRegex.test(args[2]))
      throw new ClientError('Damage rank is invalid');

    if (!rankRegex.test(args[3]))
      throw new ClientError('Support rank is invalid');

    foundSignupByMsgId.tankRank = args[1].toUpperCase();
    foundSignupByMsgId.damageRank = args[2].toUpperCase();
    foundSignupByMsgId.supportRank = args[3].toUpperCase();
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
