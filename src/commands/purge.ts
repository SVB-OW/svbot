import { Command, ClientError } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'purge',
	description: 'Deletes max 100 previous messages in the channel',
	allowedPermissions: PermissionFlagsBits.Administrator,
	props: [{ name: 'number', required: false }],
	async execute({ ia }) {

		const num = ia.options.data[0].value ? Number.parseInt(ia.options.data[0].value.toString()) : 100
		if (num < 1 || num > 100) throw new ClientError(ia, 'Number must be in range 1-100')

		await ia.channel!.bulkDelete(num)
		ia.reply(num + ' messages have been deleted').then((m) => setTimeout(() => m.delete(), 3000))
	},
})
