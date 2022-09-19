import { Message } from 'discord.js'

export class ClientError extends Error {
	msg: Message

	constructor(msg: Message, ...params: any[]) {
		super(...params)
		this.name = 'ClientError'
		this.msg = msg
	}
}
