// objects of props fields of commands
export class CommandProperty {
  name: string = '';
  required?: boolean = false;

  constructor(obj?: Partial<CommandProperty>) {
    Object.assign(this, obj);
  }
}
