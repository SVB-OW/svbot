module.exports = {
  name: 'latency',
  description: 'Replies with the bots latency',
  permission: 'ADMINISTRATOR',
  async execute(msg) {
    msg.channel.send(`Latency to bot: ${Date.now() - msg.createdTimestamp}ms`);
  },
};
