//#region Preparation
import { ActivityType, ChannelType, GatewayIntentBits } from 'discord.js'
import { ClientError, CommandClient } from './types'
import { dbLive, discordToken, isProd, mongoUri, prodErrorEmail } from './config'
import type { Db } from 'mongodb'
import type { ICommandInteraction } from './types'
import type { Interaction } from 'discord.js'
import { MongoClient } from 'mongodb'
import { join } from 'path'
import { readdirSync } from 'fs'

const sendmail = require('sendmail')({ silent: true })
const client = new CommandClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	],
})

// Init mongodb and inMemory db
const dbClient = new MongoClient(mongoUri)

// Init db
let mongoDb: Db
	// Ugly async await block
;(async () => {
	await dbClient.connect()
	mongoDb = dbClient.db(dbLive)
})()
//#endregion

//#region Dynamic commands
// Import all files from ./commands and map to client.commands
const commandFiles = readdirSync(join(process.cwd(), '/out/commands')).filter((file: string) => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(join(process.cwd(), '/out/commands', file))
	client.commands.set(command.name, command)
}
//#endregion

client.on('ready', async () => {
	client.user?.setActivity('The Ranked Gauntlet', { type: ActivityType.Competing })
	console.log(`Logged in as ${client.user?.tag} from ${isProd ? 'production' : 'development'}!`)
})

client.on('interactionCreate', async (ia: Interaction) => {
	// Exit without error
	if (!ia.isChatInputCommand() || !(ia.channel?.type === ChannelType.GuildText)) return

	// Find command
	const cmd = client.commands.get(ia.commandName)
	if (!cmd) throw new ClientError(ia, 'Command not found')

	// Channel validation
	if (cmd.allowedChannels.length > 0 && !cmd.allowedChannels.includes(ia.channel.name))
		throw new ClientError(ia, 'This command is not permitted in this channel')

	// Execution
	await cmd.execute({
		ia: ia as ICommandInteraction,
		mongoSignups: mongoDb.collection('signups'),
		mongoLobbies: mongoDb.collection('lobbies'),
		mongoContestants: mongoDb.collection('contestants'),
	})
})

// #region Global Error Handler
async function errorHandler(err: any) {
	// Send client errors back to channel
	if (err instanceof ClientError) {
		// Handle known errors
		if (err.ia.replied)
			err.ia.editReply({
				content: `\`\`\`diff\n- Error: ${err.message.substring(0, 200)}\n\`\`\``,
			})
		else
			err.ia.reply({
				content: `\`\`\`diff\n- Error: ${err.message.substring(0, 200)}\n\`\`\``,
				ephemeral: true,
			})
	} else if (err instanceof Error && isProd) {
		// Handle unknown errors in prod
		const html = `<h1>Name: ${err.name}</h1><h3>Message: ${err.message}</h3></div><pre>${err.stack}</pre>`

		sendmail({
			from: 'svbot@svb.net',
			to: prodErrorEmail,
			subject: 'Error in SVBot Production',
			html,
		})
	} else {
		// Handle unknown errors in dev
		console.error(err)
	}
}

process.on('unhandledRejection', errorHandler)
process.on('uncaughtException', errorHandler)
// #endregion

client.login(discordToken)
