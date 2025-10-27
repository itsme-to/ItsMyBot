import { Manager, Addon, User, ConditionData, Base, CommandBuilder, ContextMenuBuilder, ComponentBuilder } from '@itsmybot';
import { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, ButtonInteraction, ModalSubmitInteraction, AnySelectMenuInteraction } from 'discord.js';

export abstract class Command<T extends Addon | undefined = undefined>  extends Base<T> {
  public data: CommandBuilder;
  public conditions: ConditionData[]

  constructor(manager: Manager, addon?: T) {
    super(manager, addon);

    this.data = this.build();
    this.conditions = this.manager.services.condition.buildConditions(this.data.conditions, false)
  }

  public abstract build(): CommandBuilder;

  public commandBuilder(): CommandBuilder {
    return new CommandBuilder();
  }

  public async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<void | any> {
    throw new Error('Method not implemented.');
  }

  public execute(interaction: ChatInputCommandInteraction<'cached'>, user: User): Promise<void | any> {
    throw new Error('Method not implemented.');
  }
}

export abstract class ContextMenu<T extends Addon | undefined = undefined>  extends Base<T> {
  public data: ContextMenuBuilder;
  public conditions: ConditionData[]

  constructor(manager: Manager, addon?: T) {
    super(manager, addon);

    this.data = this.build();
    this.conditions = this.manager.services.condition.buildConditions(this.data.conditions, false)
  }

  public abstract build(): ContextMenuBuilder;

  public execute(interaction: ContextMenuCommandInteraction<'cached'>, user: User): Promise<void | any> {
    throw new Error('Method not implemented.');
  }
}

abstract class BaseComponent<T extends Addon | undefined = undefined> extends Base<T> {
  public abstract customId: string;
  public data: ComponentBuilder;
  public conditions: ConditionData[]

  constructor(manager: Manager, addon?: T) {
    super(manager, addon);

    this.data = this.build();
    this.conditions = this.manager.services.condition.buildConditions(this.data.conditions, false)
  }

  public build(): ComponentBuilder {
    return new ComponentBuilder();
  }

  public abstract execute(interaction: AnySelectMenuInteraction<'cached'> | ButtonInteraction<'cached'> | ModalSubmitInteraction<'cached'>, user: User): Promise<void | any>
}

export abstract class Button<T extends Addon | undefined = undefined> extends BaseComponent<T> {}
export abstract class SelectMenu<T extends Addon | undefined = undefined> extends BaseComponent<T> {}
export abstract class Modal<T extends Addon | undefined = undefined> extends BaseComponent<T> {}