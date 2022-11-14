// objects of props fields of commands
export type CommandProperty = {
	name: string
	description?: string
	required?: boolean
	type?: 'string' | 'number' | 'boolean' | 'attachment'
	choices?: { [key: string]: string | number | boolean }
}
