import { Manager, Addon, User, ConditionData, Base, ContextMenuBuilder } from '@itsmybot';
import { ContextMenuCommandInteraction } from 'discord.js';

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