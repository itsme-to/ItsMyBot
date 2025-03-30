import { Manager, Addon, User, ConditionData } from '@itsmybot';
import { ButtonInteraction, ModalSubmitInteraction, AnySelectMenuInteraction } from 'discord.js';
import { ComponentBuilder } from '@builders';
import { Base } from '@contracts';

export abstract class Component<T extends Addon | undefined = undefined> extends Base<T> {
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