import { Rank, Region } from '..'
import type { Signup } from '..'

export class Lobby {
	_id?: string
	rank: Rank = Rank.BRONZE
	region: Region = Region.EU
	streamer = ''
	tankPlayers: Signup[] = []
	damagePlayers: Signup[] = []
	supportPlayers: Signup[] = []
	pingMsgId = ''
	pingOccured: string = new Date().toISOString()
	pingAnnounced = false
	pingCleared = false;
	[key: string]: any // makes object properties indexable

	constructor(obj?: Partial<Lobby>) {
		Object.assign(this, obj)
	}
}
