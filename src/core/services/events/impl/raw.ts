import { Event, Events, Context, Utils, Variable } from '@itsmybot';
import { DMChannel } from 'discord.js';

interface RawEventPacket {
  t: string;
  d: {
    channel_id: string;
    message_id: string;
    emoji: {
      id: string;
      name: string;
    };
    user_id: string;
  };
}

export default class RawEvent extends Event {
  name = Events.Raw;

  async execute(packet: RawEventPacket) {
    const eventMapping: { [key: string]: string } = {
      'MESSAGE_REACTION_ADD': 'messageReactionAdd',
      'MESSAGE_REACTION_REMOVE': 'messageReactionRemove'
    };

    const event = eventMapping[packet.t];
    if (!event) return;

    const contextData = await this.createContextFromPacket(packet);
    if (!contextData) return;

    this.manager.services.engine.event.emit(event, contextData.context, contextData.variables);
  }

  async createContextFromPacket(packet: RawEventPacket): Promise<{ context: Context; variables: Variable[] } | undefined> {
    const { d: data } = packet;
    const channel = Utils.findTextChannel(data.channel_id);
    if (!channel || channel instanceof DMChannel) return;

    if (!channel.guild || channel.guild.id !== this.manager.primaryGuildId) return;

    const message = await channel.messages.fetch(data.message_id);
    if (!message) return;

    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let member = undefined

    try {
      member = await channel.guild.members.fetch({ user: data.user_id, force: true });
    } catch (e) { }

    const user = member ? await this.manager.services.user.findOrCreate(member) : await this.manager.services.user.findOrNull(data.user_id);

    const context: Context = {
      guild: channel.guild,
      message: message,
      channel: message.channel,
      content: emojiKey,
      member: member,
      user: user || undefined
    };

    const variables = [
      { name: 'reaction_emoji', value: emojiKey },
    ];

    return { context, variables };
  }
}
