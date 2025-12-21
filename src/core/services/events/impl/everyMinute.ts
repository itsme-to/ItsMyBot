import { Event, Context, Events } from '@itsmybot';
import { Guild } from 'discord.js';

export default class EveryMinuteEvent extends Event {
  name = Events.EveryMinute;

  async execute(primaryGuild: Guild) {
    const context: Context = {
      guild: primaryGuild,
      content: new Date().getMinutes().toString()
    };

    const variables = [
      { name: 'minute', value: new Date().getMinutes().toString() }
    ]

    this.manager.services.engine.event.emit('everyMinute', context, variables);
  }
};
