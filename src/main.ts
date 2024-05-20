//#region Preparation
import { ActivityType, ChannelType, GatewayIntentBits } from 'discord.js'
import { ClientError, CommandClient } from './types/index.js'
import { dbLive, discordToken, isProd, mongoUri, prodErrorEmail, sendGridApiKey } from './config.js'
import type { Db } from 'mongodb'
import Fuse from 'fuse.js'
import type { ICommandInteraction } from './types/index.js'
import type { Interaction } from 'discord.js'
import { MongoClient } from 'mongodb'
import { join } from 'path'
import { readdirSync } from 'fs'
import sgMail from '@sendgrid/mail'

const client = new CommandClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	],
})

// Init db
const dbClient = new MongoClient(mongoUri)
await dbClient.connect()
const mongoDb = dbClient.db(dbLive)
//#endregion

//#region Dynamic commands
// Import all files from ./commands and map to client.commands
const commandFiles = readdirSync(join(process.cwd(), '/out/commands')).filter((file: string) => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = await import(join(process.cwd(), '/out/commands', file))
	client.commands.set(command.default.name, command.default)
}
//#endregion

client.on('ready', async () => {
	client.user?.setActivity('The Ranked Gauntlet', { type: ActivityType.Competing })
	console.log(
		`Logged in as ${client.user?.tag} from ${isProd ? 'production' : 'development'} at ${new Date().toISOString()}!`,
	)
})

client.on('messageCreate', async msg => {
	if (!msg.content.toLowerCase().startsWith('/')) return
	if (msg.author.bot || !client.application) return
	const cmdString = msg.content.split(' ')[0].substring(1)

	const fuse = new Fuse([...client.commands.values()], { keys: ['name'], threshold: 0.4 })
	const searchResult = fuse.search(cmdString)[0]
	console.log('fuse', fuse.search(cmdString)[0])

	if (!searchResult) return

	const cmd = (await client.application.commands.fetch()).find(c => c.name === searchResult.item.name)
	const allowedChannel = msg.guild?.channels.cache.find(
		c => c.name.toLowerCase() === searchResult.item.allowedChannels[0],
	)
	const helpChannel = msg.guild?.channels.cache.find(c => c.name.toLowerCase() === 'help')

	if (allowedChannel && msg.channel.id !== allowedChannel.id) {
		msg.reply(
			`Hi! I am SVBot. You probably wanted to use a slash command, but discord is funny and didn't pick it up. Go to <#${
				allowedChannel.id
			}> and try again using the popup that opens above the message box. If you still have issues, please send a message in <#${
				helpChannel?.id || 'help'
			}>.`,
		)
		return
	}

	msg.reply(
		`Hi! I am SVBot. You probably wanted to use a slash command, but discord is funny and didn't pick it up. Try again using the popup that opens above the message box or click here: </${
			cmd?.name
		}:${cmd?.id}>. If you still have issues, please send a message in <#${helpChannel?.id || 'help'}>.`,
	)
})

client.on('interactionCreate', async (ia: Interaction) => {
	try {
		// Exit without error
		if (!ia.isChatInputCommand() || !(ia.channel?.type === ChannelType.GuildText)) return

		// Find command
		const cmd = client.commands.get(ia.commandName)
		if (!cmd) throw new ClientError(ia as ICommandInteraction, 'Command not found')

		// Channel validation
		if (cmd.allowedChannels.length > 0 && !cmd.allowedChannels.includes(ia.channel.name))
			throw new ClientError(ia as ICommandInteraction, 'This command is not permitted in this channel')

		// Execution
		await cmd.execute({
			ia: ia as ICommandInteraction,
			mongoSignups: mongoDb.collection('signups'),
			mongoLobbies: mongoDb.collection('lobbies'),
			mongoContestants: mongoDb.collection('contestants'),
		})
	} catch (err: any) {
		err.ia = ia
		errorHandler(err)
	}
})

// #region Global Error Handler
async function errorHandler(err: any) {
	// Send client errors back to channel
	if (err instanceof ClientError) {
		// Handle known errors
		if (err.ia.deferred)
			err.ia.editReply({
				content: `\`\`\`diff\n- Error: ${err.message.substring(0, 200)}\n\`\`\``,
			})
		else
			err.ia.reply({
				content: `\`\`\`diff\n- Error: ${err.message.substring(0, 200)}\n\`\`\``,
				ephemeral: true,
			})
	} else if (err instanceof Error && isProd && sendGridApiKey && prodErrorEmail) {
		// Handle unknown errors in prod
		sgMail.setApiKey(sendGridApiKey)
		const html = `<h1>Name: ${err.name}</h1><h3>Message: ${err.message}</h3></div><pre>${err.stack}</pre>`

		await sgMail.send({
			from: prodErrorEmail,
			to: prodErrorEmail,
			subject: 'Error in SVBot Production',
			html,
		})

		console.error(new Date().toISOString(), err.name, err.message, err.stack, { prodErrorEmail, sendGridApiKey })
	} else {
		// Handle unknown errors in dev
		errorHandler(new ClientError(err.ia, 'An unknown error occurred'))
		throw err
	}
}

// #endregion

client.login(discordToken)
