import { Command, ClientError } from '../types';

module.exports = new Command({
  name: 'countdown',
  description: 'Decrements the played count of one or more player',
  props: [{ name: 'discordIds', required: true }],
  allowedChannels: ['bot-commands'],
  async execute({ msg, args, mongoSignups }) {
    if (args.length === 0)
      throw new ClientError(msg, 'Command must include at least one user id');

    args.forEach(async value => {
      let foundUser = await mongoSignups.findOne({ discordId: value });
      if (!foundUser)
        throw new ClientError(msg, `Signup for ${value} was not found`);

      foundUser.gamesPlayed--;
      mongoSignups.updateOne({ discordId: value }, { $set: foundUser });
    });
  },
});
