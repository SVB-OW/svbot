import { Command } from '../types'
import { PermissionFlagsBits } from 'discord.js'

module.exports = new Command({
	name: 'env',
	description: 'Outputs the content of the NODE_ENV variable',
	allowedPermissions: PermissionFlagsBits.Administrator,
	props: [
		{ name: 'Regular string', description: 'Something casual', required: true, choices: {
			'Choice 1': 'Bread',
			'Choice 2': 'Ice Cream',
		} },
		{
			name: 'A number',
			description: 'Something favourite',
			required: true,
			choices: {
				'Neutral': 4,
				'Chotic': 13,
				'Evil': 666
			}
		},
		{
			name: 'Rocc', description: 'Boolean with choices', required: true, type: 'boolean', choices: {
				'Yep': true,
				'Nop': false
			}
		},
		{
			name: 'Big haha', description: 'Boolean without choices', required: true, type: 'boolean'
		},
	],
	async execute({ ia }) {
		ia.reply(process.env.NODE_ENV || 'local')
	},
})
