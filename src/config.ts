const dbProd = 'svbot';
const dbTest = 'svbot-test';
const prefixProd = '!';
const prefixTest = ',';

export const isProd = process.env.NODE_ENV === 'production';
export const discordToken = process.env.DISCORD_TOKEN;
export const mongoUri = process.env.MONGO_URI;
export const dbLive = isProd ? dbProd : dbTest;
export const prefixLive = isProd ? prefixProd : prefixTest;
export const btagRegex = new RegExp(/.{3,}#[0-9]{4,}/);
export const regionRegex = new RegExp(/^(EU|NA)$/, 'i');
