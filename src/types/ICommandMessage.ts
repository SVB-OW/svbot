import { Guild, Message, TextChannel } from 'discord.js';
import { CommandClient } from './CommandsClient';

export interface ICommandMessage extends Message {
  guild: Guild;
  client: CommandClient;
  channel: TextChannel;
}
