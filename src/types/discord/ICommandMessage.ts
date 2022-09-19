import { Guild, Message, TextChannel } from 'discord.js'
import { CommandClient } from '..'

// This interface exists so I don't have to check if the below properties always exist
export interface ICommandMessage extends Message {
	guild: Guild
	client: CommandClient
	channel: TextChannel
}
