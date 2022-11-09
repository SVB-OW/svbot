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

const res = await mongoSignups.updateMany({}, { $set: { discordName: '' } })

console.log('res', res)
