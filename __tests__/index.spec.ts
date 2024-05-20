import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { baseMockIA, closeDb, mockDb } from './helpers/mocks'
import type { Db } from 'mongodb'

describe('Mock Signup', () => {
	let mongoDb: Db
	beforeAll(async () => {
		mongoDb = await mockDb()
	})
	afterAll(async () => {
		await closeDb()
	})

	it('default', async () => {
		expect(true).toBeTruthy()
	})
})
