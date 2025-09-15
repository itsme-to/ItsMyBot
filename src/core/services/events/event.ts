
import { Addon, Base } from '@itsmybot';

export abstract class Event<T extends Addon | undefined = undefined> extends Base<T>{
  abstract name: string
  once: boolean = false;
  priority: number = 3;
  every: number = 1;
  current: number = 1;
  canceled: boolean = false;

  public abstract execute(...args: any): any | void;

  /**
    * Cancel the execution of further events in the current event cycle.
    */
  cancelEvent() {
    this.canceled = true;
  }
}