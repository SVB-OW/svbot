const { ClientError } = require('../types');
const { rankRegex } = require('../config');

module.exports = {
  name: 'confirm',
  description: 'Confirms a signup entry',
  props: [
    { name: 'signupMsgId', required: true },
    { name: 'tankRank', required: true },
    { name: 'dpsRank', required: true },
    { name: 'supportRank', required: true },
  ],
  allowedChannels: ['signup', 'bot-commands'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    if (args.length !== 4)
      throw new ClientError(
        'Invalid number of arguments. Format is ".confirm <msgId> <tankRank> <dpsRank> <supportRank>',
      );

    const signupChannel = msg.guild.channels.cache.find(
      c => c.name === 'signup',
    );
    if (!signupChannel) throw new ClientError('Signup channel does not exist');

    let foundSignupByMsgId = await mongoSignups.findOne({
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
        ),
      );

    if (foundSignupByMsgId.damageRank !== '-')
      member.roles.add(
        msg.guild.roles.cache.find(
          r => r.name.toUpperCase() === foundSignupByMsgId.damageRank,
        ),
      );

    if (foundSignupByMsgId.supportRank !== '-')
      member.roles.add(
        msg.guild.roles.cache.find(
          r => r.name.toUpperCase() === foundSignupByMsgId.supportRank,
        ),
      );

    // TODO: Old messages might not be fetchable
    signupChannel.messages
      .fetch(foundSignupByMsgId.signupMsgId)
      .then(oldMsg => {
        oldMsg.react('👍');
      });

    msg.channel.send('Signup successfully validated');
  },
};
