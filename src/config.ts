import { config } from 'dotenv'

config()

const dbProd = 'svbot'
const dbTest = 'svbot-test'

export const isProd = process.env.NODE_ENV === 'production'
export const dbLive = isProd ? dbProd : dbTest
export const btagRegex = new RegExp(/.{3,}#[0-9]{4,}/)
export const regionRegex = new RegExp(/^(EU|NA)$/, 'i')
export const discordToken = process.env.DISCORD_TOKEN as string
export const mongoUri = process.env.MONGO_URI as string
