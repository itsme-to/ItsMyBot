import { Addon, Base } from '@itsmybot';

export abstract class Leaderboard<T extends Addon | undefined = undefined> extends Base<T>{
  abstract name: string;
  abstract description: string;

  abstract getData(): Promise<string[]>;
}
