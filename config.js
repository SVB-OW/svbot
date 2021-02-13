module.exports = {
  discordToken: 'Nzg1OTEyNzkxNzM5MjY5MTMw.X8-wUw.3UV0IpkVAsp1kBTQ7HsE3Fd6G3c',
  mongoUri:
    'mongodb+srv://svbot:ZHCenGjnTpK9ZcqX@svbotcluster.1h7rr.mongodb.net/svbot?retryWrites=true&w=majority',
  dbProd: 'svbot',
  dbTest: 'svbot-test',
  prefixLive: process.env.NODE_ENV === 'production' ? '!' : ',',
  prefixProd: '!',
  prefixTest: ',',
  btagRegex: new RegExp(/.{3,}#[0-9]{4,}/),
  regionRegex: new RegExp(/^(EU|NA)$/, 'i'),
  rankRegex: new RegExp(
    /^(Bronze|Silver|Gold|Platinum|Diamond|Master|Grandmaster|-)$/,
    'i',
  ),
};
