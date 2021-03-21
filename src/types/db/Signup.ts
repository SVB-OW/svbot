export class Signup {
  _id?: string;
  discordId: string = '';
  battleTag: string = '';
  region: string = '';
  signupMsgId: string = '';
  signedUpOn: string = '';
  confirmedOn: string = '';
  confirmedBy: string = '';
  tankRank: string = '';
  damageRank: string = '';
  supportRank: string = '';
  gamesPlayed: number = 0;
  screenshot: string = '';
  [key: string]: any; // makes object properties indexable

  constructor(obj?: Partial<Signup>) {
    Object.assign(this, obj);
  }
}
