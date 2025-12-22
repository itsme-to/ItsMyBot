import { Addon, User, Variable } from '@itsmybot';
import { Channel, ChatInputCommandInteraction, Guild, GuildMember, Message, MessageComponentInteraction, ModalSubmitInteraction, Role } from 'discord.js';

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
  interaction?: ChatInputCommandInteraction<'cached'> | MessageComponentInteraction<'cached'> | ModalSubmitInteraction<'cached'>;
  role?: Role;
  data?: Map<string, ItemData[]>;
}