const { ClientError } = require('../types');

module.exports = {
  name: 'update',
  description: 'Updates a property of one or more users',
  props: [
    { name: 'property', required: true },
    { name: 'value', required: true },
    { name: 'discordTags', required: true },
  ],
  allowedRoles: ['Admin'],
  allowedChannels: ['bot-commands'],
  async execute(msg, args, db, mongoDb, lobby) {
    console.log('args', args);
    if (msg.mentions.users.size === 0)
      throw new ClientError(
        'Command must include a mention of a user as the first argument',
      );
    msg.mentions.users.forEach((value, key) => {
      let foundUser = db.signups.find(item => item.discordId === key);
      if (args[0] in foundUser) {
        foundUser[args[0]] = args[1];
        mongoDb.updateOne({ discordId: key }, { $set: foundUser });
      }
    });
  },
};
