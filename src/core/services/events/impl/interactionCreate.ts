import Utils from '@utils';
import { Command, Component, Event, User, Addon, Events, Context } from '@itsmybot';
import { CommandInteraction, Interaction, ButtonInteraction, RepliableInteraction, AnySelectMenuInteraction, ModalSubmitInteraction } from 'discord.js';
import { CommandSubcommandBuilder } from 'core/builders/command';


export default class InteractionCreateEvent extends Event {
  name = Events.InteractionCreate;

  public async execute(interaction: Interaction<'cached'>) {

    const user = interaction.member
      ? await this.manager.services.user.findOrCreate(interaction.member)
      : await this.manager.services.user.findOrNull(interaction.user.id) as User;

    if (interaction.isCommand() || interaction.isContextMenuCommand() || interaction.isAutocomplete()) {
      const command = this.manager.services.command.getCommand(interaction.commandName);
      if (!command) return;

      if (interaction.isAutocomplete()) {
        try {
          await command.autocomplete(interaction)
        } catch (error: any) {
          this.logger.error(`Error executing autocomplete command '${command.data.name}`, error);
        }
      } else {
        this.handleInteraction(interaction, command, user);
      }
    } else if (interaction.isButton()) {
      const button = this.manager.services.component.getButton(interaction.customId);
      if (!button) return this.manager.client.emit(Events.Button, interaction, user);

      this.handleInteraction(interaction, button, user)
    } else if (interaction.isAnySelectMenu()) {
      const selectMenu = this.manager.services.component.getSelectMenu(interaction.customId);
      if (!selectMenu) return this.manager.client.emit(Events.SelectMenu, interaction, user);

      this.handleInteraction(interaction, selectMenu, user);
    } else if (interaction.isModalSubmit()) {
      const modal = this.manager.services.component.getModal(interaction.customId);
      if (!modal) return this.manager.client.emit(Events.ModalSubmit, interaction, user);

      this.handleInteraction(interaction, modal, user);
    }
  }

  private async handleInteraction(
    interaction: CommandInteraction<'cached'>,
    component: Command<Addon | undefined>,
    user: User
  ): Promise<void>;

  private async handleInteraction(
    interaction: ButtonInteraction<'cached'> | AnySelectMenuInteraction<'cached'> | ModalSubmitInteraction<'cached'>,
    component: Component<Addon | undefined>,
    user: User
  ): Promise<void>;

  private async handleInteraction<T extends Command | Component>(
    interaction: any,
    component: T,
    user: User
  ) {
    if (!component.data.public && interaction.guildId && interaction.guildId !== this.manager.primaryGuildId) {
      return interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection("only-in-primary-guild"),
        context: { user }
      }));
    }

    const requirementsMet = await this.checkRequirements(interaction, component, user);
    if (!requirementsMet) return;

    try {
      if (component instanceof Command) {
        if (component.data.subcommands.length) {
          const subcommand = component.data.subcommands.find((subcommand: CommandSubcommandBuilder) => subcommand.name === interaction.options.getSubcommand());
          if (!subcommand) return;

          if (subcommand.execute) {
            await subcommand.execute(interaction, user);
            return;
          }
        }
      }
      await component.execute(interaction, user);
    } catch (error: any) {
      this.logger.error(`Error executing ${component.data.name}`, error);
    }

    component.data.cooldown.setCooldown(interaction.user.id);
  }

  async checkRequirements(interaction: RepliableInteraction<'cached'>, component: Command | Component, user: User) {
    const context: Context = {
      user: user,
      member: interaction.member,
      guild: interaction.guild,
      channel: interaction.channel || undefined
    }

    if (component.data.cooldown.isOnCooldown(interaction.user.id)) {
      await interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection("interaction.in-cooldown"),
        variables: [
          { searchFor: "%cooldown%", replaceWith: component.data.cooldown.endsAtFormatted(interaction.user.id) },
        ],
        context
      }));
      return false;
    }

    const isMet = await this.manager.services.condition.meetsConditions(component.conditions, context, []);

    if (!isMet) {
      await interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection("interaction.no-permission"),
        context
      }));
      return false;
    }

    return true;
  }
};