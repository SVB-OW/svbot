import { PermissionResolvable } from 'discord.js';
import { CommandProperty, ICommandOptions } from '..';

// bot command files
export class Command {
  name: string = '';
  description: string = '';
  props: CommandProperty[] = [];
  allowedChannels: string[] = [];
  allowedRoles: string[] = [];
  permission = '' as PermissionResolvable;
  async execute(options: ICommandOptions): Promise<void> {}

  constructor(obj?: Partial<Command>) {
    Object.assign(this, obj);
  }
}
