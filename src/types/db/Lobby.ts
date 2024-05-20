import { Rank, Region } from '../index.js'
import type { Signup } from '../index.js'

export class Lobby {
	_id?: string
	rank: Rank = Rank.BRONZE
	rank2: Rank = Rank.BRONZE
	region: Region = Region.EU
	streamer = ''
	tankPlayers: Signup[] = []
	damagePlayers: Signup[] = []
	supportPlayers: Signup[] = []
	tankPlayersTeam2: Signup[] = []
	damagePlayersTeam2: Signup[] = []
	supportPlayersTeam2: Signup[] = []
	pingMsgId = ''
	pingOccured: string = new Date().toISOString()
	pingAnnounced = false
	pingCleared = false;
	[key: string]: any // makes object properties indexable

	constructor(obj?: Partial<Lobby>) {
		Object.assign(this, obj)
	}
}
