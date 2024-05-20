import { Client, Collection } from 'discord.js'
import type { ClientOptions } from 'discord.js'

import type { Command } from '../index.js'

export class CommandClient extends Client {
	commands: Collection<string, Command> = new Collection()

	constructor(options: ClientOptions) {
		super(options)
	}
}
