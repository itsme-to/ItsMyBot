import { BitFieldResolvable, ChatInputCommandInteraction } from 'discord.js';
import { Manager, Addon } from '@itsmybot';
import { Logger } from '@utils';
import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent, Attachment, AttachmentBuilder, BufferResolvable, MessageMentionOptions, PollData } from 'discord.js';
import { Stream } from 'stream';

export { Context } from './context.js';
export { Events, EventType } from './events.js';
export { ClientOptions, ManagerOptions, Services, ManagerConfigs } from './manager.js';

export { IsPermissionFlag, IsActivityType, IsTextInputStyle, IsChannelType, IsCommandOptionType, IsBooleanOrString } from './decorators/validator.js';

export { BaseConfig } from './config/baseConfig.js';
export { BaseConfigSection } from './config/baseConfigSection.js';
import { Config } from './config/config.js';
export { CommandValidator } from './validators/command.js';
export { MessageValidator } from './validators/message.js';
export { ButtonValidator, ComponentValidator, ModalValidator } from './validators/component.js';

export { ConditionValidator, MutatorValidator, ActionValidator, TriggerActionValidator } from './validators/scripting.js';

export { Config };

export interface Variable {
  searchFor: string;
  replaceWith: string | number | undefined | null | boolean;
}

export enum PaginationType {
  SelectMenu = "select_menu",
  Button = "button"
}

export type LogConfigOptions = "minor" | "moderate" | "high" | "major" | "critical";

export interface MessageOutput {
  allowedMentions: MessageMentionOptions,
  components: APIActionRowComponent<APIMessageActionRowComponent>[],
  content: string | undefined,
  embeds: APIEmbed[],
  files: (Attachment | AttachmentBuilder | Stream | BufferResolvable)[],
  poll?: PollData
  flags: BitFieldResolvable<any, any>
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