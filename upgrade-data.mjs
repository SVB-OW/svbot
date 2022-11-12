import { dbLive, mongoUri } from './out/config.js'
import { MongoClient } from 'mongodb'

// Init mongodb and inMemory db
const dbClient = new MongoClient(mongoUri)

// Init db
await dbClient.connect()
const mongoDb = dbClient.db(dbLive)

console.log('status', mongoDb.namespace)

const mongoSignups = mongoDb.collection('signups')
const mongoLobbies = mongoDb.collection('lobbies')
const mongoContestants = mongoDb.collection('contestants')

async function setDiscordNames() {
	return await mongoSignups.updateMany({}, { $set: { discordName: '' } })
}

async function resetPlaying() {
	return await mongoSignups.updateMany({}, { $set: { playing: false } })
}

// console.log('res', setDiscordNames())
console.log('res', await resetPlaying())

dbClient.close()
