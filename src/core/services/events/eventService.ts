import { join, dirname } from 'path';
import { sync } from 'glob';
import { fileURLToPath } from 'url';
import { Manager, Event, Addon } from '@itsmybot';
import { Collection } from 'discord.js';
import { Service } from '../../contracts/index.js';

/**
 * Service to manage events in the bot.
 */
export default class EventService extends Service {
  events: Collection<string, EventExecutor>;

  constructor(manager: Manager) {
    super(manager);
    this.events = new Collection();
  }

  async initialize() {
    this.manager.logger.info("Event service initialized.");
    await this.registerFromDir(join(dirname(fileURLToPath(import.meta.url)), 'impl'))
  }

  async registerFromDir(eventsDir: string, addon: Addon | undefined = undefined) {
    const eventFiles = sync(join(eventsDir, '**', '*.js').replace(/\\/g, '/'));

    for (const filePath of eventFiles) {
      const eventPath = new URL('file://' + filePath.replace(/\\/g, '/')).href;
      const { default: event } = await import(eventPath);

      await this.registerEvent(new event(this.manager, addon));
    };
  }

  async registerEvent(event: Event<Addon | undefined>) {
    try {
      if (!this.events.has(event.name)) {
        this.events.set(event.name, new EventExecutor(event.once || false));
      }
      this.events.get(event.name)?.addEvent(event);
    } catch (error: any) {
      event.logger.error(`Error initializing event '${Event.name}'`, error);
    }
  }

  initializeEvents() {
    for (const [name, executor] of this.events) {

      if (executor.once) {
        this.manager.client.once(name, (...args) => {
          executor.run(...args);
        });
      } else {
        this.manager.client.on(name, (...args) => {
          executor.run(...args);
        });
      }
    }
  }
}

export class EventExecutor {
  events: Event<Addon | undefined>[] = [];
  once;

  constructor(once: boolean = false) {
    this.once = once;
  }

  addEvent(event: Event<Addon | undefined>) {
    this.events.push(event);
    this.events.sort((a, b) => a.priority - b.priority);
  }

  async run(...args: any[]) {
    let i = 0;

    while (i < this.events.length) {
      const event = this.events[i];
      try {
        if (event.every > 1 && event.current < event.every) {
          event.current++;
        } else {
          event.current = 1;
          await event.execute(...args);
          if (event.canceled) break;
        }
      } catch (error: any) {
        event.logger.error(`Error executing event '${event.name}'`, error);
      }
      i++;
    }
  }
}
