export class Run {
  _id?: string;
  contestantId: string = '';
  ongoing: boolean = true;
  bronzePoints: number = 0;
  silverPoints: number = 0;
  goldPoints: number = 0;
  platinumPoints: number = 0;
  diamondPoints: number = 0;
  masterPoints: number = 0;
  grandmasterPoints: number = 0;
  [key: string]: any; // makes object properties indexable

  constructor(obj?: Partial<Run>) {
    Object.assign(this, obj);
  }
}
