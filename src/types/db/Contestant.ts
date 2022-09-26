import { Region } from '..'

export class Contestant {
	_id?: string
	name = ''
	region: Region = Region.EU
	personalBest = 0
	currentTotal = 0
	bronzePoints = 0
	silverPoints = 0
	goldPoints = 0
	platinumPoints = 0
	diamondPoints = 0
	masterPoints = 0
	grandmasterPoints = 0;
	[key: string]: any // makes object properties indexable

	constructor(obj?: Partial<Contestant>) {
		Object.assign(this, obj)
	}
}
