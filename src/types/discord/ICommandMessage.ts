import { Guild, Message, TextChannel } from 'discord.js';
import { CommandClient } from '..';

export interface ICommandMessage extends Message {
  guild: Guild;
  client: CommandClient;
  channel: TextChannel;
}
