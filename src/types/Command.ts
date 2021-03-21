import { Message, PermissionResolvable } from 'discord.js';
import { Collection } from 'mongodb';
import { CommandProperty } from './CommandProperty';
import { ICommandMessage } from './ICommandMessage';

// bot command files
export class Command {
  name: string = '';
  description: string = '';
  props: CommandProperty[] = [];
  allowedChannels: string[] = [];
  allowedRoles: string[] = [];
  permission = '' as PermissionResolvable;
  async execute(
    msg: ICommandMessage,
    args: string[],
    mongoSignups: Collection,
    mongoLobbies: Collection,
  ): Promise<void> {}

  constructor(obj?: Partial<Command>) {
    Object.assign(this, obj);
  }
}
