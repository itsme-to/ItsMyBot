import { Addon, Context, Base } from '@itsmybot';

export abstract class Expansion<T extends Addon | undefined = undefined> extends Base<T>{
  abstract name: string;

  abstract onRequest(context: Context, placeholderName: string): Promise<string | undefined>
}
