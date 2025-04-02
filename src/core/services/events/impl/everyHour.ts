import { Event, Context, Events } from '@itsmybot';

export default class EveryHourEvent extends Event {
  name = Events.EveryHour;

  async execute() {
    const guild = this.manager.client.guilds.cache.get(this.manager.primaryGuildId);

    const context: Context = {
      guild: guild,
    };

    this.manager.services.engine.event.emit('everyHour', context);
  }
};
