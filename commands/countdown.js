const { ClientError } = require('../types');

module.exports = {
  name: 'countdown',
  description: 'Decrements the played cound of one or more player',
  props: [{ name: 'discordIds', required: true }],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    if (args.length === 0)
      throw new ClientError('Command must include at least one user id');

    args.forEach(async value => {
      let foundUser = await mongoSignups.findOne({ discordId: value });
      if (!foundUser)
        throw new ClientError(`Signup for ${value} was not found`);

      foundUser.gamesPlayed--;
      mongoSignups.updateOne({ discordId: value }, { $set: foundUser });
    });
  },
};
