import { Message } from 'discord.js';
import { Signup, Rank, Region } from '.';

export class Lobby {
  _id?: string;
  rank: Rank = Rank.BRONZE;
  region: Region = Region.EU;
  streamer: string = '';
  tankPlayers: Signup[] = [];
  damagePlayers: Signup[] = [];
  supportPlayers: Signup[] = [];
  pingMsgId: string = '';
  pingMsg?: Message;
  pingOccured: string = new Date().toISOString();
  pingAnnounced: boolean = false;
  pingCleared: boolean = false;
  [key: string]: any; // makes object properties indexable

  constructor(obj?: Partial<Lobby>) {
    Object.assign(this, obj);
  }
}
