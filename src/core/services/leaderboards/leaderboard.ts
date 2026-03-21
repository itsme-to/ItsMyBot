import { Addon, Base, LeaderboardEntry } from '@itsmybot';


export abstract class Leaderboard<T extends Addon | undefined = undefined> extends Base<T>{
  abstract name: string;
  abstract description: string;

  abstract getData(): Promise<LeaderboardEntry[]>;

  formatValue(entry: LeaderboardEntry): string | Promise<string> {
    return entry.value.toString()
  }
}