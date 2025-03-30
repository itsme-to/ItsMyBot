import { CommandInteraction } from '@contracts';
import { Addon, User } from '@itsmybot';
import { Channel, Guild, GuildMember, Message, MessageComponentInteraction, Role } from 'discord.js';

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
}