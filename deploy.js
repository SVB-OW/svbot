const { Collection, SlashCommandBuilder, Routes, PermissionFlagsBits } = require('discord.js')
const { REST } = require('@discordjs/rest')
const fs = require('node:fs')
const path = require('node:path')

//#region Dynamic commands
const commandsCollection = new Collection()
// Import all files from ./commands and map to client.commands
const commandFiles = fs.readdirSync(path.join(process.cwd(), '/out/commands')).filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(path.join(process.cwd(), '/out/commands', file))
	commandsCollection.set(command.name, command)
}
//#endregion

const commands = commandsCollection.map((cmd) =>
	new SlashCommandBuilder()
		.setName(cmd.name)
		.setDescription(cmd.description)
		.setDefaultMemberPermissions(cmd.allowedPermissions || 0)
		.toJSON(),
)

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

// Register commands once (SVBot Server)
// rest
// 	.put(Routes.applicationGuildCommands('785912791739269130', '784164409606012958'), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error)

// Register commands once (global)
rest
	.put(Routes.applicationCommands('785912791739269130'), { body: commands })
	.then(() => console.log('Successfully registered all application commands.'))
	.catch(console.error)

// Delete all commands (SVBot Server)
// rest
// 	.put(Routes.applicationGuildCommands('785912791739269130', '784164409606012958'), { body: [] })
// 	.then(() => console.log('Successfully deleted application commands.'))
// 	.catch(console.error)

// Delete all commands (global)
// rest
// 	.put(Routes.applicationCommands('785912791739269130'), { body: [] })
// 	.then(() => console.log('Successfully deleted all application commands.'))
// 	.catch(console.error)
