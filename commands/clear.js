module.exports = {
  name: 'clear',
  description:
    'Kicks all players with @Ingame from voice lobbies and removes their role',
  allowedChannels: ['bot-commands'],
  async execute(msg, args, db, mongoDb, lobby) {
    lobby = {
      pingMsg: null, //null
      rank: '',
      region: '',
      streamer: '',
      tankPlayers: [],
      damagePlayers: [],
      supportPlayers: [],
    };

    let role = msg.guild.roles.cache.find(role => role.name === 'Ingame');
    let ingamePlayers = msg.guild.roles.cache.get(role.id).members;
    ingamePlayers.forEach(value => {
      value.voice.setChannel(null);
      value.roles.remove(role);
    });
    msg.channel.send('Ingame role cleared');
  },
};
