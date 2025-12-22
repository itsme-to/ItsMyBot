import { Event, Context, Events } from '@itsmybot';
import { Guild } from 'discord.js';

export default class EveryDayEvent extends Event {
  name = Events.EveryDay;

  async execute(primaryGuild: Guild) {
    const context: Context = {
      guild: primaryGuild,
      content: new Date().toDateString()
    };

    const variables = [
      { name: 'date', value: new Date().toDateString() }
    ]

    this.manager.services.engine.event.emit('everyDay', context, variables);
  }
};
