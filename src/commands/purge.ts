import { ClientError, Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'
import type { TextChannel } from 'discord.js'

module.exports = new Command({
	name: 'purge',
	description: 'Deletes max 100 previous messages in the channel',
	allowedPermissions: PermissionFlagsBits.ManageMessages,
	props: [{ name: 'number', required: false }],
	async execute({ ia }) {
		const num = ia.options.getNumber('number') ?? 100
		if (num < 1 || num > 100) throw new ClientError(ia, 'Number must be in range 1-100')

		// Need to fetch messages, because they can only be deleted from cache
		await ia.channel!.messages.fetch({ limit: num })
		await (ia.channel! as TextChannel).bulkDelete(num, true)
		await ia.reply({ content: num + ' messages deleted!', ephemeral: true })
	},
})
