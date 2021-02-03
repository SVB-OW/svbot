module.exports = {
  discordToken: 'Nzg1OTEyNzkxNzM5MjY5MTMw.X8-wUw.3UV0IpkVAsp1kBTQ7HsE3Fd6G3c',
  mongoUri:
    'mongodb+srv://svbot:ZHCenGjnTpK9ZcqX@svbotcluster.1h7rr.mongodb.net/svbot?retryWrites=true&w=majority',
  dbName: process.env.NODE_ENV === 'production' ? 'svbot-beta' : 'svbot',
  prefix: process.env.NODE_ENV === 'production' ? '!' : ',', // No spaces
  btagRegex: new RegExp(/.{3,}#[0-9]{4,}/),
  regionRegex: new RegExp(/^(EU|NA)$/, 'i'),
  rankRegex: new RegExp(
    /^(Bronze|Silver|Gold|Platinum|Diamond|Master|Grandmaster|-)$/,
    'i',
  ),
  // Multi server capability (might not be needed)
  servers: {
    // SVBot Test
    '786309976074616883': {
      botCommands: '786309976795906063',
      matchmaker: '786309976795906064',
      signup: '786309977252954122',
      playerPings: '786309977252954123',
      // Roles
      lobbyHost: '786309976334925876',
    },
    // The Ranked Gauntlet TEST
    '805952413739384842': {
      botCommands: '805952414199971890',
      matchmaker: '805952414199971892',
      signup: '805952414199971897',
      playerPings: '805952414199971898',
      // Roles
      lobbyHost: '805952413760225299',
    },
  },
};
