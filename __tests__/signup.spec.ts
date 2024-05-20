import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { baseMockIA, closeDb, mockDb } from './helpers/mocks'
import type { Attachment } from 'discord.js'
import { Collection } from 'discord.js'
import type { Db } from 'mongodb'
import type { MockInteraction } from './helpers/mocks'
const SignupCommand: any = await import('../src/commands/signup')

describe('Mock Signup', () => {
	let mongoDb: Db
	beforeAll(async () => {
		mongoDb = await mockDb()
	})
	afterAll(async () => {
		await closeDb()
	})

	it('should sign up one contestant and save it to the db', async () => {
		const ia: MockInteraction = {
			...baseMockIA,
			editReply: vi.fn(o => {
				return {
					id: '123',
					attachments: new Collection(o.files),
				}
			}),
			options: {
				getString: vi.fn((name: string) => {
					if (name === 'battle_tag') return 'Krusher99#1234'
					if (name === 'region') return 'EU'
					return ''
				}),
				getAttachment: vi.fn(() => {
					return {
						contentType: 'image/png',
						url: 'https://example.com/image.png',
					} as Attachment
				}),
			},
		}
		await SignupCommand.execute({ ia: ia as any, mongoSignups: mongoDb.collection('signups') })
		expect(ia.editReply).toHaveReturned()
		expect(mongoDb.collection('signups').countDocuments()).resolves.toBe(1)
	})
})
