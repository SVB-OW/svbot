import { Region } from '..';

export class Contestant {
  _id?: string;
  name: string = '';
  region: Region = Region.EU;
  personalBest: number = 0;
  currentTotal: number = 0;
  bronzePoints: number = 0;
  silverPoints: number = 0;
  goldPoints: number = 0;
  platinumPoints: number = 0;
  diamondPoints: number = 0;
  masterPoints: number = 0;
  grandmasterPoints: number = 0;
  [key: string]: any; // makes object properties indexable

  constructor(obj?: Partial<Contestant>) {
    Object.assign(this, obj);
  }
}
