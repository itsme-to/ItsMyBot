import { Event, Context, Events } from '@itsmybot';
import { Guild } from 'discord.js';

export default class EveryHourEvent extends Event {
  name = Events.EveryHour;

  async execute(primaryGuild: Guild) {
    const context: Context = {
      guild: primaryGuild,
      content: new Date().getHours().toString()
    };

    const variables = [
      { name: 'hour', value: new Date().getHours().toString() }
    ]

    this.manager.services.engine.event.emit('everyHour', context, variables);
  }
};
