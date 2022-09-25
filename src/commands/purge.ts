import { Command, ClientError } from '../types'
import { ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js'

module.exports = new Command({
	name: 'purge',
	description: 'Deletes max 100 previous messages in the channel',
	allowedPermissions: PermissionFlagsBits.ManageMessages,
	props: [{ name: 'number', required: false }],
	async execute({ ia }) {

		let num = 100
		if (ia.options.data.length == 1) {
			num = Number.parseInt(ia.options.data[0].value!.toString())
		}
		if (num < 1 || num > 100) throw new ClientError(ia, 'Number must be in range 1-100')

		const messages = await ia.channel!.messages.fetch({ limit: num });
		await (ia.channel! as TextChannel).bulkDelete(num, true)
		await ia.reply({ content: num + ' messages deleted!', ephemeral: true })
	},
})
