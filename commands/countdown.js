const { ClientError } = require('../types');

module.exports = {
  name: 'countdown',
  description: 'Decrements the played cound of a player',
  props: [{ name: 'discordTag', required: true }],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, db, mongoDb, lobby) {
    if (msg.mentions.users.size !== 1)
      throw new ClientError(
        'Command must include a mention of a user as the first argument',
      );
    msg.mentions.users.forEach((value, key) => {
      let foundUser = db.signups.find(item => item.discordId === key);
      foundUser.gamesPlayed--;
      mongoDb.updateOne({ discordId: key }, { $set: foundUser });
    });
  },
};
