import { Manager, Addon, User, Base, CommandBuilder, ContextMenuBuilder, CommandSubcommandBuilder, CommandSubcommandGroupBuilder } from '@itsmybot';
import { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, ButtonInteraction, ModalSubmitInteraction, AnySelectMenuInteraction, ApplicationCommandOptionBase, SlashCommandSubcommandBuilder } from 'discord.js';

export abstract class Command<T extends Addon | undefined = undefined>  extends Base<T> {
  public data: CommandBuilder;
  public enabled = true;

  constructor(manager: Manager, addon?: T) {
    super(manager, addon);
    this.data = this.build();
    this.addLanguagesString();
  }

  public abstract build(): CommandBuilder;

  public async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<void | any> {
    throw new Error('Method not implemented.');
  }

  public execute(interaction: ChatInputCommandInteraction<'cached'>, user: User): Promise<void | any> {
    throw new Error('Method not implemented.');
  }

  private addLanguagesString() {
    const lang = this.addon?.lang || this.manager.lang;

    if (!this.data.description) {
      this.data.setDescription(lang.getString(`commands.${this.data.name}.description`));
    }

    this.data.options.forEach(option => {
      this.addLanguagesStringOption(`commands.${this.data.name}`, option as any);
    });
  }

  private addLanguagesStringOption(path: string, option: CommandSubcommandBuilder | CommandSubcommandGroupBuilder | ApplicationCommandOptionBase | SlashCommandSubcommandBuilder) {
    const lang = this.addon?.lang || this.manager.lang;

    switch (true) {
      case option instanceof CommandSubcommandBuilder:
      case option instanceof CommandSubcommandGroupBuilder:
        if (!option.description) {
          option.setDescription(lang.getString(`${path}.subcommands.${option.name}.description`));
        }
        option.options?.forEach(subOption => {
          this.addLanguagesStringOption(`${path}.subcommands.${option.name}`, subOption);
        });
        break;
      default:
        if (!option.description) {
          option.setDescription(lang.getString(`${path}.options.${option.name}`));
        }
        break;
    }
  }
}

export abstract class ContextMenu<T extends Addon | undefined = undefined>  extends Base<T> {
  public data: ContextMenuBuilder;
  public enabled = true;

  constructor(manager: Manager, addon?: T) {
    super(manager, addon);

    this.data = this.build();
  }

  public abstract build(): ContextMenuBuilder;

  public execute(interaction: ContextMenuCommandInteraction<'cached'>, user: User): Promise<void | any> {
    throw new Error('Method not implemented.');
  }
}

abstract class BaseInteraction<T extends Addon | undefined = undefined> extends Base<T> {
  public abstract customId: string;
  public usingPermissionFrom?: string;
 
  public abstract execute(interaction: AnySelectMenuInteraction<'cached'> | ButtonInteraction<'cached'> | ModalSubmitInteraction<'cached'>, user: User): Promise<void | any>
}

export abstract class Button<T extends Addon | undefined = undefined> extends BaseInteraction<T> {
  public abstract override execute(interaction: ButtonInteraction<'cached'>, user: User): Promise<void | any>;
}

export abstract class SelectMenu<T extends Addon | undefined = undefined> extends BaseInteraction<T> {
  public abstract override execute(interaction: AnySelectMenuInteraction<'cached'>, user: User): Promise<void | any>;
}

export abstract class Modal<T extends Addon | undefined = undefined> extends BaseInteraction<T> {
  public abstract override execute(interaction: ModalSubmitInteraction<'cached'>, user: User): Promise<void | any>;
}