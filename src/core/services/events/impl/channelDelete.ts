import { Event, Events, Context } from '@itsmybot';
import { Channel } from 'discord.js';

export default class ChannelDeleteEvent extends Event {
  name = Events.ChannelDelete;

  async execute(channel: Channel) {
    if (channel.isDMBased()) return;
    if (!channel.guild || channel.guild.id !== this.manager.primaryGuildId) return;

    const context: Context = {
      guild: channel.guild,
      channel: channel,
      content: channel.name,
    };

    this.manager.services.engine.event.emit('channelDelete', context);
  }
};