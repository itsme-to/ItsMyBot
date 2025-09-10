import Utils from '@utils';
import { Command, ContextMenu, Event, User, Addon, Events, Context, Button, SelectMenu, Modal } from '@itsmybot';
import { CommandSubcommandBuilder, CommandSubcommandGroupBuilder } from '@builders';
import { Interaction, RepliableInteraction } from 'discord.js';

export default class InteractionCreateEvent extends Event {
  name = Events.InteractionCreate;

  public async execute(interaction: Interaction<'cached'>) {

    const user = interaction.member
      ? await this.manager.services.user.findOrCreate(interaction.member)
      : await this.manager.services.user.findOrNull(interaction.user.id) as User;

    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      const command = this.manager.services.interaction.getCommand(interaction.commandName);
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
    } else if (interaction.isContextMenuCommand()) {
      const contextMenu = this.manager.services.interaction.getContextMenu(interaction.commandName)
      if (!contextMenu) return;
      this.handleInteraction(interaction, contextMenu, user);
    } else if (interaction.isButton()) {
      const button = this.manager.services.interaction.getButton(interaction.customId);
      if (!button) return this.manager.client.emit(Events.ButtonClick, interaction, user);

      this.handleInteraction(interaction, button, user)
    } else if (interaction.isAnySelectMenu()) {
      const selectMenu = this.manager.services.interaction.getSelectMenu(interaction.customId);
      if (!selectMenu) return this.manager.client.emit(Events.SelectMenu, interaction, user);

      this.handleInteraction(interaction, selectMenu, user);
    } else if (interaction.isModalSubmit()) {
      const modal = this.manager.services.interaction.getModal(interaction.customId);
      if (!modal) return this.manager.client.emit(Events.ModalSubmit, interaction, user);

      this.handleInteraction(interaction, modal, user);
    }
  }

  private async handleInteraction(
    interaction: RepliableInteraction<'cached'>,
    component: ContextMenu<Addon | undefined> | Button<Addon | undefined> | SelectMenu<Addon | undefined> | Modal<Addon | undefined> | Command<Addon | undefined>,
    user: User
  ): Promise<void>;
  private async handleInteraction<T extends Command | Button | SelectMenu | Modal | ContextMenu>(
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
        console.log(component.data.subcommands)

        if (component.data.subcommands?.length) {
          const subcommand = component.data.subcommands.find((subcommand: CommandSubcommandBuilder | CommandSubcommandGroupBuilder) => subcommand.name === interaction.options.getSubcommand());
          if (!subcommand) return;

          if (subcommand.execute) {
            await subcommand.execute(interaction, user);
            return;
          }
        }
      }
      await component.execute(interaction, user);
    } catch (error: any) {
      this.logger.error(`Error executing the command/component '${(component.data && 'name' in component.data ? (component.data as any).name : 'unknown')}'`, error);
    }

    component.data.cooldown.setCooldown(interaction.user.id);
  }

  async checkRequirements(interaction: RepliableInteraction<'cached'>, component: Command | Button | SelectMenu | Modal | ContextMenu, user: User) {
    const context: Context = {
      user: user,
      member: interaction.member,
      guild: interaction.guild,
      channel: interaction.channel || undefined
    }

    if (component.data.cooldown.isOnCooldown(interaction.user.id)) {
      await interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection("in-cooldown"),
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
        config: this.manager.configs.lang.getSubsection("no-permission"),
        context
      }));
      return false;
    }

    return true;
  }
};