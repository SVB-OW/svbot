import { EmbedBuilder } from 'discord.js'
import { prefixLive } from '../config'
import { Command } from '../types'

module.exports = new Command({
	name: 'help',
	description: 'Shows this help list of all commands or filtered by multiple names',
	props: [{ name: 'command', required: false }],
	allowedChannels: ['bot-commands'],
	// allowedRoles: ['Lobby Host', 'Gold', 'Admin'],
	async execute({ msg, args }) {
		const embed = new EmbedBuilder().setTitle('Commands').setTimestamp()

		if (args.length) {
			for (const arg of args) {
				const command = msg.client.commands.get(arg)
				if (command) {
					let propsString = (command.props || []).map((p) => (p.required ? `<${p.name}>` : `<${p.name}?>`)).join(' ')
					embed.addFields([{ name: '```' + prefixLive + arg + ' ' + propsString + '```', value: command.description }])
				}
			}
		} else {
			for (const [name, command] of msg.client.commands) {
				let propsString = (command.props || []).map((p) => (p.required ? `<${p.name}>` : `<${p.name}?>`)).join(' ')
				embed.addFields([{ name: '```' + prefixLive + name + ' ' + propsString + '```', value: command.description + '\nAllowed Roles: ' + (command.allowedRoles.join(', ') || 'All') }])
			}
		}

		await msg.channel.send({ embeds: [embed] })
	},
})
