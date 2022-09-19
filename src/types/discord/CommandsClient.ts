import { Client, ClientOptions, Collection } from 'discord.js'
import { Command } from '..'

export class CommandClient extends Client {
	commands: Collection<string, Command> = new Collection()

	constructor(options: ClientOptions) {
		super(options)
	}
}
