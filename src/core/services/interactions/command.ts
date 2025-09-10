import { CommandBuilder } from '@builders';
import { Manager, Addon, User, ConditionData, CommandInteraction, Base } from '@itsmybot';
import { AutocompleteInteraction } from 'discord.js';

export abstract class Command<T extends Addon | undefined = undefined>  extends Base<T> {
  public data: CommandBuilder;
  public conditions: ConditionData[]

  constructor(manager: Manager, addon?: T) {
    super(manager, addon);

    this.data = this.build();
    this.conditions = this.manager.services.condition.buildConditions(this.data.conditions, false)
  }

  public abstract build(): CommandBuilder;

  public async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<void | any> {
    throw new Error('Method not implemented.');
  }

  public execute(interaction: CommandInteraction, user: User): Promise<void | any> {
    throw new Error('Method not implemented.');
  }
}