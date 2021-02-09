const { ClientError } = require('../types');

module.exports = {
  name: 'countup',
  description: 'Increments the played cound of a player',
  props: [{ name: 'discordTag', required: true }],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    if (msg.mentions.users.size !== 1)
      throw new ClientError(
        'Command must include a mention of a user as the first argument',
      );
    msg.mentions.users.forEach(async (value, key) => {
      let foundUser = await mongoSignups.findOne({
        discordId: key,
      });
      foundUser.gamesPlayed++;
      mongoSignups.updateOne({ discordId: key }, { $set: foundUser });
    });
  },
};
