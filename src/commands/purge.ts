import { Command, ClientError } from '../types'
import { ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js'

module.exports = new Command({
	name: 'purge',
	description: 'Deletes max 100 previous messages in the channel',
	allowedPermissions: PermissionFlagsBits.ManageMessages,
	props: [{ name: 'number', required: false }],
	async execute({ ia }) {

		const num = ia.options.getNumber('number') ?? 100
		if (num < 1 || num > 100) throw new ClientError(ia, 'Number must be in range 1-100')

		// const messages = await ia.channel!.messages.fetch({ limit: num }); // do we need this??
		await (ia.channel! as TextChannel).bulkDelete(num, true)
		await ia.reply({ content: num + ' messages deleted!', ephemeral: true })
	},
})
