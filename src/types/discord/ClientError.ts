import type { ICommandInteraction } from '..'

export class ClientError extends Error {
	ia: ICommandInteraction

	constructor(ia: ICommandInteraction, ...params: any[]) {
		super(...params)
		this.name = 'ClientError'
		this.ia = ia
	}
}
