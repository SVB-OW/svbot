import { Region } from '..';

export class Contestant {
  _id?: string;
  name: string = '';
  region: Region = Region.EU;
  [key: string]: any; // makes object properties indexable

  constructor(obj?: Partial<Contestant>) {
    Object.assign(this, obj);
  }
}
