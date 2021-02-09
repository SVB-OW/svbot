module.exports = {
  name: 'latency',
  description: 'Replies with the bots latency',
  allowedRoles: ['Admin'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    msg.channel.send(`Latency to bot: ${Date.now() - msg.createdTimestamp}ms`);
  },
};
