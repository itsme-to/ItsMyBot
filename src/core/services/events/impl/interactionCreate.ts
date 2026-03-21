import { Command, Event, User, Events, Button, SelectMenu, Modal } from '@itsmybot';
import { CommandModel } from 'core/services/interactions/command.model.js';
import { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, Interaction, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';

export default class InteractionCreateEvent extends Event {
  name = Events.InteractionCreate;

  public async execute(interaction: Interaction<'cached'>) {
    const user = interaction.member
      ? await this.manager.services.user.findOrCreate(interaction.member)
      : await this.manager.services.user.findOrNull(interaction.user.id) as User;

    if (interaction.isChatInputCommand() || interaction.isAutocomplete() || interaction.isModalSubmit() || interaction.isContextMenuCommand() || interaction.isMessageComponent()) {
      const interactionComponent = this.manager.services.interaction.resolveInteraction(interaction);

      if (!interactionComponent && (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit())) {
        if (interaction.isButton()) {
          return this.manager.client.emit(Events.ButtonClick, interaction, user);
        }
        if (interaction.isAnySelectMenu()) {
          return this.manager.client.emit(Events.SelectMenuSubmit, interaction, user);
        }
        if (interaction.isModalSubmit()) {
          return this.manager.client.emit(Events.ModalSubmit, interaction, user);
        }
        return;
      }

      if (interaction.isAutocomplete()) {
        if (!(interactionComponent instanceof Command) || !interactionComponent.autocomplete) return;
        try {
          await interactionComponent.autocomplete(interaction)
        } catch (error: any) {
          this.logger.error(`Error executing autocomplete command '${interactionComponent.data.name}`, error);
        }
      } else {
        this.handleInteraction(interaction as any, interactionComponent as any, user);
      }
    }
  }

  private async handleInteraction(interaction: ButtonInteraction<'cached'>, component: Button, user: User): Promise<void>;
  private async handleInteraction(interaction: AnySelectMenuInteraction<'cached'>, component: SelectMenu, user: User): Promise<void>;
  private async handleInteraction(interaction: ModalSubmitInteraction<'cached'>, component: Modal, user: User): Promise<void>;
  private async handleInteraction(interaction: ChatInputCommandInteraction<'cached'>, component: Command, user: User): Promise<void>;
  private async handleInteraction(interaction: ContextMenuCommandInteraction<'cached'>, component: Command, user: User): Promise<void>;
  private async handleInteraction(interaction: any, component: any, user: User): Promise<void> {
    try {
      if (component instanceof Button || component instanceof SelectMenu) {
        const requirementsMet = await this.checkRequirements(interaction, component);
        if (!requirementsMet) return;

        return await component.execute(interaction, user);
      }

      if (interaction instanceof ModalSubmitInteraction || interaction instanceof ContextMenuCommandInteraction) {
        return await component.execute(interaction, user);
      }

      let executeComponent: any = component;
      if (component.data.executes.size > 0) {
        let executeKey: string[] = [];

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subcommandGroup) {
          executeKey.push(subcommandGroup);
          if (component.data.executes.has(executeKey.join('.'))) {
            executeComponent.execute = component.data.executes.get(executeKey.join('.'));
          }
        }

        if (subcommand) {
          executeKey.push(subcommand);
          if (component.data.executes.has(executeKey.join('.'))) {
            executeComponent.execute = component.data.executes.get(executeKey.join('.'));
          }
        }
      }

      await executeComponent.execute(interaction, user);
    } catch (error: any) {
      this.logger.error(`Error executing the interaction '${(component.data && 'name' in component.data ? (component.data as any).name : component.customId)}' (${component.constructor.name})`, error);
    }
  }

  async checkRequirements(interaction: MessageComponentInteraction<'cached'>, component: Button | SelectMenu) {
    if (component.usingPermissionFrom) {
      const command = await CommandModel.findOne({
        where: { id: component.usingPermissionFrom }
      });

      if (command && command.data.default_member_permissions) {
        const memberPermissions = interaction.channel?.permissionsFor(interaction.member);
        if (!memberPermissions || !memberPermissions.has(command.data.default_member_permissions)) {
          return false;
        }
      }
    }

    return true;
  }
};