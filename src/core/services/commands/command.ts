import { Manager, Addon, User, ConditionData } from '@itsmybot';
import { AutocompleteInteraction, ContextMenuCommandInteraction } from 'discord.js';
import { CommandInteraction, Base } from '@contracts';

export abstract class Command<T extends Addon | undefined = undefined>  extends Base<T> {
  public data: any;
  public conditions: ConditionData[]

  constructor(manager: Manager, addon?: T) {
    super(manager, addon);

    this.data = this.build();
    this.conditions = this.manager.services.condition.buildConditions(this.data.conditions, false)
  }

  public abstract build(): any;

  public async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<void | any> {
    throw new Error('Method not implemented.');
  }

  public execute(interaction: CommandInteraction | ContextMenuCommandInteraction<'cached'>, user: User): Promise<void | any> {
    throw new Error('Method not implemented.');
  }
}