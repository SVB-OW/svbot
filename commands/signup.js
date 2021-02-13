const { ClientError, Signup } = require('../types');
const { btagRegex, regionRegex } = require('../config');

module.exports = {
  name: 'signup',
  description: 'Sign up with btag, region and profile screenshot',
  props: [
    { name: 'battleTag', required: true },
    { name: 'region', required: true },
  ],
  allowedChannels: ['signup'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    // Checks command contains valid btag
    if (!args[0] || !btagRegex.test(args[0]))
      throw new ClientError(
        'Battle Tag invalid. Format should be "!signup Krusher99#1234 EU"',
      );
    // Checks the command contains a region (caseinsensitive)
    if (!args[1] || !regionRegex.test(args[1]))
      throw new ClientError(
        'Region invalid. Format should be "!signup Krusher99#1234 EU"',
      );
    // Checks the command has exactly one attachment
    // TODO: Check, the attachment is an image
    if (msg.attachments.size !== 1)
      throw new ClientError(
        'Make sure you attach a screenshot of your career profile to the message',
      );
    // Overwrite existing signup
    let existingSignup = await mongoSignups.findOne({
      discordId: msg.author.id,
    });
    if (existingSignup)
      throw new ClientError(
        'You already have signed up. If you would like to update your rank, discord or battle tag, please dm a mod.',
      );

    const attachment = msg.attachments.values().next().value;
    let signup = new Signup({
      discordId: msg.author.id,
      battleTag: args[0],
      region: args[1].toUpperCase(),
      screenshot: attachment.proxyURL,
      signupMsgId: msg.id,
      signedUpOn: new Date(msg.createdTimestamp).toISOString(),
    });

    await mongoSignups.insertOne(signup);

    await msg.channel.send(
      'Signup has been recieved and will be checked by an event moderator',
    );
  },
};
