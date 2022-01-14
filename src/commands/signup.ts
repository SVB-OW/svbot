import { ClientError, Command, Region, Signup } from '../types';
import { btagRegex, regionRegex } from '../config';

module.exports = new Command({
  name: 'signup',
  description: 'Sign up with btag, region and profile screenshot',
  props: [
    { name: 'battleTag', required: true },
    { name: 'region', required: true },
  ],
  allowedChannels: ['signup'],
  async execute({ msg, args, mongoSignups }) {
    // Checks command contains valid btag
    if (!args[0] || !btagRegex.test(args[0]))
      throw new ClientError(
        msg,
        'Battle Tag invalid. Format should be "!signup Krusher99#1234 EU"',
      );
    // Checks the command contains a region (caseinsensitive)
    if (!args[1] || !regionRegex.test(args[1]))
      throw new ClientError(
        msg,
        'Region invalid. Format should be "!signup Krusher99#1234 EU"',
      );
    // Checks the command has exactly one attachment
    // TODO: Check, the attachment is an image
    if (msg.attachments.size !== 1)
      throw new ClientError(
        msg,
        'Make sure you attach a screenshot of your career profile to the message',
      );
    // Overwrite existing signup
    const existingSignup = await mongoSignups.findOne({
      discordId: msg.author.id,
    });
    if (existingSignup)
      throw new ClientError(
        msg,
        `You already have signed up. To update your rank, post a new screenshot in #rank-update. For everything else write in #help`,
      );

    const attachment = msg.attachments.values().next().value;
    const signup = new Signup({
      discordId: msg.author.id,
      battleTag: args[0],
      region: args[1].toUpperCase() as Region,
      screenshot: attachment.proxyURL,
      signupMsgId: msg.id,
      signedUpOn: new Date(msg.createdTimestamp).toISOString(),
    });

    await mongoSignups.insertOne(signup as any);

    await msg.channel.send(
      'Signup has been received and will be checked by an event moderator',
    );
  },
});
