import type { Attachment, ChatInputCommandInteraction } from 'discord.js'
import { Client, Collection, GatewayIntentBits } from 'discord.js'
import { dbLive, mongoUri } from '../src/config'
import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
const SignupCommand = require('../src/commands/signup')

describe('Mock Signup', () => {
	let mongod: MongoMemoryServer
	let connection: MongoClient
	let mongoDb: Db

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()
		const dbClient = new MongoClient(mongod.getUri())
		connection = await dbClient.connect()
		mongoDb = dbClient.db(dbLive)
	})
	afterAll(async () => {
		setTimeout(async () => {
			await connection.close()
			await mongod.stop()
		}, 100)
	})

	// fake an interaction and define the caches
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.MessageContent,
		],
	})
	type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
	type MockInteraction = DeepPartial<ChatInputCommandInteraction<'cached'>>
	const mockIA: MockInteraction = {
		guild: {
			channels: {
				cache: new Collection(),
			},
			roles: {
				cache: new Collection(),
			},
			members: {
				cache: new Collection(),
				fetch: jest.fn(),
			},
			iconURL: jest.fn(),
		},
		deferReply: jest.fn(),
		options: {
			getString: jest.fn(),
			getNumber: jest.fn(),
			getAttachment: jest.fn(),
		},
		reply: jest.fn(),
		user: {
			id: '123',
			username: 'testuser',
		},
		createdTimestamp: 0,
		editReply: jest.fn(() => {
			return {
				attachments: {
					first: jest.fn(() => {
						return {
							url: 'https://example.com/image.png',
						}
					}),
				},
			}
		}),
	}

	it('test signup', async () => {
		const ia = {
			...mockIA,
			options: {
				getString: jest.fn((name: string) => {
					if (name === 'battle_tag') return 'Krusher99#1234'
					if (name === 'region') return 'EU'
					return ''
				}),
				getAttachment: jest.fn(() => {
					return {
						contentType: 'image/png',
						url: 'https://example.com/image.png',
					} as Attachment
				}),
			},
		}
		await SignupCommand.execute({ ia: ia as any, mongoSignups: mongoDb.collection('signups') })
		expect(ia.editReply).toHaveReturned()
	})
})

// describe("Command Functions", () => {
// 	beforeEach(() => {
// 		jest.clearAllMocks();
// 	});
//
// 	const client = jest.fn()
//
// 	const ia = ({
// 		channel: {
// 			send: jest.fn(),
// 		},
// 		content: "",
// 		author: {
// 			bot: false,
// 		},
// 	} as unknown) as Message;
//
// 	it("should send error messages quietly", async () => {
// 		await interaction()
// 		expect(ia.reply).toBeCalledWith("moo")
// 	})
// })

// refs:
// https://jestjs.io/docs/expect
// https://www.youtube.com/watch?v=5TjXmsJtWZc
// https://github.com/stuyy/jest-unit-tests-demo/blob/master/__tests__/index.spec.ts
