import { ClientError, Command, Region, Signup } from '../types'
import { btagRegex, regionRegex } from '../config'

module.exports = new Command({
	name: 'signup',
	description: 'Sign up with btag, region and profile screenshot',
	props: [
		{ name: 'battle_tag', required: true },
		{ name: 'region', required: true },
	],
	allowedChannels: ['signup'],
	async execute({ ia, mongoSignups }) {
		// Checks command contains valid btag
		let btag = ia.options.getString('battletag', true)
		if (!btagRegex.test(btag)) throw new ClientError(ia, 'Battle Tag invalid. Format should be "!signup Krusher99#1234 EU"')

		// Checks the command contains a region (caseinsensitive)
		let region = ia.options.getString('region', true)
		if (!regionRegex.test(region)) throw new ClientError(ia, 'Region invalid. Format should be "!signup Krusher99#1234 EU"')

		// Checks the command has exactly one attachment
		let imgtypes = ['.jpg', '.png']
		let img = ia.options.getAttachment('screenshot', true)
		if (img?.size !== 1) throw new ClientError(ia, 'Make sure you attach a screenshot of your career profile to the message')
		if (imgtypes.indexOf(img?.proxyURL.substr(-4, 4)) !== -1) throw new ClientError(ia, 'Image type is not accepted')

		// Overwrite existing signup
		const existingSignup = await mongoSignups.findOne({
			discordId: ia.user.id,
		})
		if (existingSignup) throw new ClientError(ia, `You already have signed up. To update your rank, post a new screenshot in #rank-update. For everything else write in #help`)

		const signup = new Signup({
			discordId: ia.user.id,
			battleTag: btag,
			region: region.toUpperCase() as Region,
			screenshot: img.proxyURL,
			signupMsgId: ia.id,
			signedUpOn: new Date(ia.createdTimestamp).toISOString(),
		})

		await mongoSignups.insertOne(signup as any)

		await ia.reply('Signup has been received and will be checked by an event moderator')
	},
})
