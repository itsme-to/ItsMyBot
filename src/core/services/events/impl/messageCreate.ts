import { Message } from 'discord.js';
import { Event, Context, Events } from '@itsmybot';
import Utils from '@utils';

export default class MessageCreateEvent extends Event {
  name = Events.MessageCreate;

  async execute(message: Message<true>) {
    if (!message.guild || message.guild.id !== this.manager.primaryGuildId) return;
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

    await user.increment('messages');

    this.manager.services.engine.event.emit('messageCreate', context);
  }
};
