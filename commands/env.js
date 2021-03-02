module.exports = {
  name: 'env',
  description: 'Outputs the content of the NODE_ENV variable',
  permission: 'ADMINISTRATOR',
  async execute(msg) {
    msg.channel.send(process.env.NODE_ENV || 'local');
  },
};
