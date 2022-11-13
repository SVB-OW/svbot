import { Region } from '..'

export class Signup {
	_id?: string
	discordId = ''
	discordName = ''
	battleTag = ''
	region: Region = Region.EU
	signupMsgId = ''
	signedUpOn = ''
	confirmedOn = ''
	confirmedBy = ''
	tankRank = ''
	damageRank = ''
	supportRank = ''
	gamesPlayed = 0
	screenshot = ''
	playing = false;
	[key: string]: any // makes object properties indexable

	constructor(obj?: Partial<Signup>) {
		Object.assign(this, obj)
	}
}
