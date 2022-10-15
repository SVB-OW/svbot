import { Collection, Routes, SlashCommandBuilder } from 'discord.js'
import { REST } from '@discordjs/rest'
import { config } from 'dotenv'
import { join } from 'node:path'
import { readdirSync } from 'node:fs'

config()

//#region Dynamic commands
const commandsCollection = new Collection()
// Import all files from ./commands and map to client.commands
const commandFiles = readdirSync(join(process.cwd(), '/out/commands')).filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = await import('./out/commands/' + file)
	commandsCollection.set(command.default.name, command.default)
}
//#endregion

const commands = commandsCollection.map(cmd => {
	const slash = new SlashCommandBuilder()
		.setName(cmd.name)
		.setDescription(cmd.description)
		.setDefaultMemberPermissions(cmd.allowedPermissions || 0)
		.setDMPermission(false)

	cmd.props.forEach(prop => {
		if (prop.type === 'number')
			slash.addNumberOption(option =>
				option
					.setName(prop.name)
					.setDescription(prop.name)
					.setRequired(prop.required || false),
			)
		else if (prop.type === 'boolean')
			slash.addBooleanOption(option =>
				option
					.setName(prop.name)
					.setDescription(prop.name)
					.setRequired(prop.required || false),
			)
		else if (prop.type === 'attachment')
			slash.addAttachmentOption(option =>
				option
					.setName(prop.name)
					.setDescription(prop.name)
					.setRequired(prop.required || false),
			)
		else
			slash.addStringOption(option =>
				option
					.setName(prop.name)
					.setDescription(prop.name)
					.setRequired(prop.required || false),
			)
	})
	return slash.toJSON()
})

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

// Delete all commands (global)
await rest
	.put(Routes.applicationCommands(process.env.DISCORD_BOT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error)

// Register commands once (global)
await rest
	.put(Routes.applicationCommands(process.env.DISCORD_BOT_ID), { body: commands })
	.then(() => console.log('Successfully registered all application commands.'))
	.catch(console.error)
