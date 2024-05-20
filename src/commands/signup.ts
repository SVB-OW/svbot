import { ClientError, Command, Region, Signup } from '../types/index.js'
import { btagRegex } from '../config.js'

export default new Command({
	name: 'signup',
	description: 'Sign up with btag, region and profile screenshot',
	props: [
		{ name: 'battle_tag', required: true },
		{ name: 'region', required: true, choices: Region },
		{ name: 'profile_screenshot', required: true, type: 'attachment' },
	],
	allowedChannels: ['signup'],
	async execute({ ia, mongoSignups }) {
		await ia.deferReply()
		// Checks command contains valid btag
		const btag = ia.options.getString('battle_tag', true)
		if (!btagRegex.test(btag))
			throw new ClientError(ia, 'Battle Tag invalid. Format should be "/signup Krusher99#1234 EU"')

		const region = ia.options.getString('region', true)

		// Checks the command has exactly one attachment
		const img = ia.options.getAttachment('profile_screenshot', true)
		if (!img.contentType?.startsWith('image/')) throw new ClientError(ia, 'File type is not accepted')

		// Check for existing signup
		const existingSignup = await mongoSignups.findOne({ discordId: ia.user.id })
		if (existingSignup)
			throw new ClientError(
				ia,
				`You already have signed up. To update your rank, post a new screenshot in #rank-update. For everything else write in #help`,
			)

		const reply = await ia.editReply({
			content: 'Signup has been received and will be checked by an event moderator',
			files: [img],
		})

		const screenshot = reply.attachments.first()?.url
		const signup = new Signup({
			discordId: ia.user.id,
			discordName: ia.user.username.split('#')[0],
			battleTag: btag,
			region: region.toUpperCase() as Region,
			screenshot: screenshot,
			signupMsgId: reply.id,
			signedUpOn: new Date(ia.createdTimestamp).toISOString(),
		})

		mongoSignups.insertOne(signup)
	},
})
