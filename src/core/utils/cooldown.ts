import { Collection, time } from 'discord.js';

export class Cooldown {
  duration: number;
  ids: Collection<string, number>;

  constructor(durationInSeconds: number) {
    this.duration = durationInSeconds * 1000;
    this.ids = new Collection();
  }

  public isOnCooldown(id: string): boolean {
    if (!this.ids.has(id)) return false;
    const now = new Date().getTime();
    const lastUsed = this.ids.get(id);
    if (lastUsed === undefined) {
      throw new Error(`Expected a timestamp for id ${id}, but none was found.`);
    }

    return now - lastUsed < this.duration;
  }

  public setCooldown(id: string): boolean {
    if (this.isOnCooldown(id)) return false

    this.ids.set(id, new Date().getTime());
    return true;
  }

  public getRemainingTime(id: string): number {
    if (!this.ids.has(id)) return 0;
    const now = new Date().getTime();
    const lastUsed = this.ids.get(id);
    if (lastUsed === undefined) {
      throw new Error(`Expected a timestamp for user ${id}, but none was found.`);
    }
    const timeElapsed = now - lastUsed;
    return Math.max(0, this.duration - timeElapsed);
  }

  public reset(id: string) {
    this.ids.delete(id);
  }

  public resetAll() {
    this.ids.clear();
  }

  public endsAtFormatted(id: string): string {
    if (!this.ids.has(id)) {
      throw new Error(`User ${id} is not in cooldown.`);
    }
    const lastUsed = this.ids.get(id);
    if (lastUsed === undefined) {
      throw new Error(`Expected a timestamp for user ${id}, but none was found.`);
    }
    return time(Math.round((lastUsed + this.duration) / 1000), "R");
  }
}
