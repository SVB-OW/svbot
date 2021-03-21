import { Client, Collection } from 'discord.js';
import { Command } from '..';

export class CommandClient extends Client {
  commands: Collection<string, Command> = new Collection();

  constructor(...params: any[]) {
    super(...params);
  }
}
