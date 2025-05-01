import { ActionRowData, APIMessageTopLevelComponent, BitFieldResolvable, APIEmbed, Attachment, AttachmentBuilder, BufferResolvable, MessageMentionOptions, PollData, ChatInputCommandInteraction, MessageActionRowComponentBuilder, MessageActionRowComponentData, TopLevelComponentData, JSONEncodable } from 'discord.js';
import { Manager, Addon } from '@itsmybot';
import { Logger } from '@utils';
import { Stream } from 'stream';

export { Context } from './context.js';
export { Events, EventType } from './events.js';
export { ClientOptions, ManagerOptions, Services, ManagerConfigs } from './manager.js';
export { IsPermissionFlag, IsActivityType, IsTextInputStyle, IsChannelType, IsCommandOptionType, IsBooleanOrString } from './decorators/validator.js';
export { BaseConfig } from './config/baseConfig.js';
export { BaseConfigSection } from './config/baseConfigSection.js';
export { CommandValidator } from './validators/command.js';
export { MessageValidator, ButtonValidator, SelectMenuValidator } from './validators/message.js';
export { ModalValidator } from './validators/component.js';
export { ConditionValidator, MutatorValidator, ActionValidator, TriggerActionValidator } from './validators/scripting.js';
export { Config } from './config/config.js';

export interface Variable {
  searchFor: string;
  replaceWith: string | number | undefined | null | boolean;
}

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