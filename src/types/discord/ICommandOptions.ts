import { Collection } from 'mongodb';
import { Contestant, ICommandMessage, Lobby, Run, Signup } from '..';

export interface ICommandOptions {
  msg: ICommandMessage;
  args: string[];
  mongoSignups: Collection<Signup>;
  mongoLobbies: Collection<Lobby>;
  mongoContenstants: Collection<Contestant>;
  mongoRuns: Collection<Run>;
}
