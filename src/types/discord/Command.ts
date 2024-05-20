import type { CommandProperty, ICommandOptions } from '../index.js'
import { PermissionFlagsBits } from 'discord.js'

// bot command files
export class Command {
	name = ''
	description = ''
	props: CommandProperty[] = []
	allowedChannels: string[] = []
	allowedPermissions: bigint = PermissionFlagsBits.SendMessages
	// eslint-disable-next-line
	async execute(options: ICommandOptions): Promise<void> {}

	constructor(obj?: Partial<Command>) {
		Object.assign(this, obj)
	}
}
