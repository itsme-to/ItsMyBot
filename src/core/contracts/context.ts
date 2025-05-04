import { Addon, User, CommandInteraction, Variable } from '@itsmybot';
import { Channel, Guild, GuildMember, Message, MessageComponentInteraction, Role } from 'discord.js';

interface ListData {
  variables: Variable[];
  context: Context;
}

export interface Context {
  user?: User;
  member?: GuildMember;
  channel?: Channel
  message?: Message;
  guild?: Guild;
  content?: string;
  addon?: Addon;
  interaction?: CommandInteraction | MessageComponentInteraction;
  role?: Role;
  list?: Map<string, ListData[]>;
}