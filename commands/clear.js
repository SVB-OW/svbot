module.exports = {
  name: 'clear',
  description:
    'Kicks all players with @Ingame from voice lobbies and removes their role',
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups, mongoLobbies) {
    let lobby = await mongoLobbies.findOne({}, { sort: { $natural: -1 } });

    lobby.cleared = true;
    mongoLobbies.updateOne({ _id: lobby._id }, { $set: lobby });

    let role = msg.guild.roles.cache.find(role => role.name === 'Ingame');
    let ingamePlayers = msg.guild.roles.cache.get(role.id).members;
    ingamePlayers.forEach(value => {
      value.voice.setChannel(null);
      value.roles.remove(role);
    });
    msg.channel.send('Ingame role cleared');
  },
};
