import { ClientError, Command, Signup } from '../types'
import { btagRegex, regionRegex } from '../config'
import type { Region } from '../types'

module.exports = new Command({
	name: 'signup',
	description: 'Sign up with btag, region and profile screenshot',
	props: [
		{ name: 'battle_tag', required: true },
		{ name: 'region', required: true },
		{ name: 'profile_screenshot', required: true, type: 'attachment' },
	],
	allowedChannels: ['signup'],
	async execute({ ia, mongoSignups }) {
		// Checks command contains valid btag
		const btag = ia.options.getString('battle_tag', true)
		if (!btagRegex.test(btag))
			throw new ClientError(ia, 'Battle Tag invalid. Format should be "!signup Krusher99#1234 EU"')

		// Checks the command contains a region (caseinsensitive)
		const region = ia.options.getString('region', true)
		if (!regionRegex.test(region))
			throw new ClientError(ia, 'Region invalid. Format should be "!signup Krusher99#1234 EU"')

		// Checks the command has exactly one attachment
		const img = ia.options.getAttachment('profile_screenshot', true)
		console.log('img', img)
		if (!img.contentType?.startsWith('image/')) throw new ClientError(ia, 'File type is not accepted')

		// Check for existing signup
		const existingSignup = await mongoSignups.findOne({ discordId: ia.user.id })
		if (existingSignup)
			throw new ClientError(
				ia,
				`You already have signed up. To update your rank, post a new screenshot in #rank-update. For everything else write in #help`,
			)

		const reply = await ia.reply('Signup has been received and will be checked by an event moderator')

		const signup = new Signup({
			discordId: ia.user.id,
			battleTag: btag,
			region: region.toUpperCase() as Region,
			screenshot: img.proxyURL,
			signupMsgId: reply.id,
			signedUpOn: new Date(ia.createdTimestamp).toISOString(),
		})

		mongoSignups.insertOne(signup)
	},
})
