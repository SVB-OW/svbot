const dbProd = 'svbot';
const dbTest = 'svbot-test';
const prefixProd = '!';
const prefixTest = ',';

export const isProd = process.env.NODE_ENV === 'production';
export const discordToken =
  'Nzg1OTEyNzkxNzM5MjY5MTMw.X8-wUw.3UV0IpkVAsp1kBTQ7HsE3Fd6G3c';
export const mongoUri =
  'mongodb+srv://svbot:ZHCenGjnTpK9ZcqX@svbotcluster.1h7rr.mongodb.net/svbot?retryWrites=true&w=majority';
export const dbLive = isProd ? dbProd : dbTest;
export const prefixLive = isProd ? prefixProd : prefixTest;
export const btagRegex = new RegExp(/.{3,}#[0-9]{4,}/);
export const regionRegex = new RegExp(/^(EU|NA)$/, 'i');
