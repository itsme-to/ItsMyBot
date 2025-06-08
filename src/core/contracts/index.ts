import { ActionRowData, APIMessageTopLevelComponent, BitFieldResolvable, APIEmbed, Attachment, AttachmentBuilder, BufferResolvable, MessageMentionOptions, PollData, ChatInputCommandInteraction, MessageActionRowComponentBuilder, MessageActionRowComponentData, TopLevelComponentData, JSONEncodable, ActionRowBuilder, ContainerBuilder, FileBuilder, MediaGalleryBuilder, SectionBuilder, SeparatorBuilder, TextDisplayBuilder,  } from 'discord.js';
import { Manager, Addon } from '@itsmybot';
import { Logger } from '@utils';
import { Stream } from 'stream';

export * from './context.js';
export * from './events.js';
export * from './manager.js';
export * from './decorators/validator.js';
export * from './config/baseConfig.js';
export * from './config/baseConfigSection.js';
export * from './validators/command.js';
export * from './validators/message.js';
export * from './validators/component.js';
export * from './validators/scripting.js';
export * from './config/config.js';

export interface Variable {
  searchFor: string;
  replaceWith: string | number | undefined | null | boolean;
}


export type TopLevelComponentBuilder = 
  ActionRowBuilder<MessageActionRowComponentBuilder> |
  ContainerBuilder |
  FileBuilder | 
  MediaGalleryBuilder |
  SectionBuilder |
  SeparatorBuilder |
  TextDisplayBuilder;

export interface MessageOutput {
  allowedMentions: MessageMentionOptions,
  components: (ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder> | TopLevelComponentData | APIMessageTopLevelComponent | JSONEncodable<APIMessageTopLevelComponent>)[],
  content: string | undefined,
  embeds: APIEmbed[],
  files: (Attachment | AttachmentBuilder | Stream | BufferResolvable)[],
  poll?: PollData
  flags?: BitFieldResolvable<any, number> | undefined
}

export type CommandInteraction = ChatInputCommandInteraction<'cached'>;

export class Base<T extends Addon | undefined = undefined> {
  public manager: Manager;
  public addon: T;
  public logger: Logger;

  constructor(manager: Manager, addon?: T) {
    this.manager = manager;
    this.addon = addon as T;
    this.logger = addon ? addon.logger : manager.logger;
  }
}

export abstract class Service {
  public manager: Manager

  constructor(manager: Manager) {
    this.manager = manager
  }

  abstract initialize(): Promise<void>
}