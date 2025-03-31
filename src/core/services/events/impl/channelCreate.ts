import { Event, Context, Events } from '@itsmybot';
import { Channel } from 'discord.js';

export default class ChannelCreateEvent extends Event {
  name = Events.ChannelCreate;

  async execute(channel: Channel) {
    if (channel.isDMBased()) return;
    if (!channel.guild || channel.guild.id !== this.manager.primaryGuildId) return;

    const context: Context = {
      guild: channel.guild,
      channel: channel,
      content: channel.name,
    };

    this.manager.services.engine.event.emit('channelCreate', context);
  }
};