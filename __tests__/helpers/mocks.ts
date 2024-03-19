import { type ChatInputCommandInteraction, Collection } from 'discord.js'
import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { vi } from 'vitest'

let mongod: MongoMemoryServer
let dbClient: MongoClient
let connection: { close: () => any }
let mongoDb: Db

export async function mockDb() {
	mongod = await MongoMemoryServer.create()
	dbClient = new MongoClient(mongod.getUri())
	connection = await dbClient.connect()
	mongoDb = dbClient.db('svbot-test')

	return mongoDb
}

export async function closeDb() {
	setTimeout(async () => {
		await connection.close()
		await mongod.stop()
	}, 100)
}

// fake interaction
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
export type MockInteraction = DeepPartial<ChatInputCommandInteraction<'cached'>>
export const baseMockIA: MockInteraction = {
	createdTimestamp: 0,
	deferReply: vi.fn(),
	editReply: vi.fn(),
	guild: {
		channels: {
			cache: new Collection(),
		},
		iconURL: vi.fn(),
		members: {
			cache: new Collection(),
			fetch: vi.fn(),
		},
		roles: {
			cache: new Collection(),
		},
	},
	options: {
		getAttachment: vi.fn(),
		getNumber: vi.fn(),
		getString: vi.fn(),
	},
	reply: vi.fn(),
	user: {
		id: '123',
		username: 'testuser',
	},
}
