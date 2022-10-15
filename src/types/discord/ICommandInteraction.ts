import type { ChatInputCommandInteraction, Client, Guild, TextChannel } from 'discord.js'

// This interface exists so I don't have to check if the below properties always exist
export interface ICommandInteraction extends ChatInputCommandInteraction {
	guild: Guild
	client: Client
	channel: TextChannel
}
