import { Message } from 'discord.js';
import { Event, Context, Events, Utils } from '@itsmybot';

export default class MessageDeleteEvent extends Event {
  name = Events.MessageDelete;

  async execute(message: Message) {
    if (!message.guild || message.guild.id !== this.manager.primaryGuildId) return;
    if (!message.author) return;
    
    const user = message.member ? await this.manager.services.user.findOrCreate(message.member) : await this.manager.services.user.findOrNull(message.author.id);

    if (!user) return;

    message.content = Utils.blockPlaceholders(message.content);

    const context: Context = {
      message: message,
      member: message.member || undefined,
      user: user,
      guild: message.guild,
      channel: message.channel,
      content: message.content || message.embeds[0]?.description || message.embeds[0]?.title || (message.embeds.length ? 'Embed' : undefined),
    };

    this.manager.services.engine.event.emit('messageDelete', context);
  }
};
