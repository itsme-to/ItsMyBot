import { Addon, User, Variable } from '@itsmybot';
import { Channel, ChatInputCommandInteraction, Guild, GuildMember, Message, MessageComponentInteraction, Role } from 'discord.js';

interface ItemData {
  variables: Variable[];
  context: Context;
}

export interface Context {
  user?: User;
  member?: GuildMember;
  channel?: Channel;
  message?: Message;
  guild?: Guild;
  content?: string;
  addon?: Addon;
  interaction?: ChatInputCommandInteraction<'cached'> | MessageComponentInteraction;
  role?: Role;
  data?: Map<string, ItemData[]>;
}