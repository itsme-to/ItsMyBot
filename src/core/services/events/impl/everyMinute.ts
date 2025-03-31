import { Event, Context, Events } from '@itsmybot';

export default class EveryMinuteEvent extends Event {
  name = Events.EveryMinute;

  async execute() {
    const guild = this.manager.client.guilds.cache.get(this.manager.primaryGuildId);

    const context: Context = {
      guild: guild,
    };

    this.manager.services.engine.event.emit('everyMinute', context);
  }
};
