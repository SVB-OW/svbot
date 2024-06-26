import { config } from 'dotenv'

config()

const dbProd = 'svbot'
const dbTest = 'svbot-test'

export const isProd = process.env.NODE_ENV === 'production'
export const dbLive = isProd ? dbProd : dbTest
export const btagRegex = new RegExp(/.{3,}#[0-9]{4,}/)
export const discordToken = process.env.DISCORD_TOKEN || ''
export const mongoUri = process.env.MONGO_URI || ''
export const prodErrorEmail = process.env.PROD_ERROR_EMAIL || ''
export const sendGridApiKey = process.env.SENDGRID_API_KEY || ''
