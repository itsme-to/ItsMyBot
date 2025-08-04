import { Addon, User, CommandInteraction, Variable } from '@itsmybot';
import { Channel, Guild, GuildMember, Message, MessageComponentInteraction, Role } from 'discord.js';

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
  interaction?: CommandInteraction | MessageComponentInteraction;
  role?: Role;
  data?: Map<string, ItemData[]>;
}