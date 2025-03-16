import Utils from '@utils';
import { Command, Component, Event, User, Plugin } from '@itsmybot';
import { Events, Context } from '@contracts';
import { CommandInteraction, Interaction, ButtonInteraction, RepliableInteraction, AnySelectMenuInteraction, ModalSubmitInteraction } from 'discord.js';


export default class InteractionCreateEvent extends Event {
  name = Events.InteractionCreate;

  public async execute(interaction: Interaction<'cached'>) {

    const user = interaction.member
      ? await this.manager.services.user.findOrCreate(interaction.member)
      : await this.manager.services.user.findOrNull(interaction.user.id) as User;

    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      const command = this.manager.services.command.getCommand(interaction.commandName);
      if (!command) return;

      this.handleInteraction(interaction, command, user);
    } else if (interaction.isAutocomplete()) {
      const command = this.manager.services.command.getCommand(interaction.commandName);
      if (!command || !command.autocomplete) return

      try {
        await command.autocomplete(interaction)
      } catch (error: any) {
        this.logger.error(`Error executing autocomplete command '${command.data.name}`, error);
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
    component: Command<Plugin | undefined>,
    user: User
  ): Promise<void>;

  private async handleInteraction(
    interaction: ButtonInteraction<'cached'> | AnySelectMenuInteraction<'cached'> | ModalSubmitInteraction<'cached'>,
    component: Component<Plugin | undefined>,
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
      await component.execute(interaction, user);
    } catch (error: any) {
      this.logger.error(`Error executing ${component.data.name}`, error);
    }

    component.data.cooldown.setCooldown(interaction.user.id);
  }

  async checkRequirements(interaction: RepliableInteraction<'cached'>, component: Command | Component, user: User) {
    if (!interaction.member || !interaction.channel) return true;

    const context: Context = {
      user: user,
      member: interaction.member,
      guild: interaction.guild || undefined,
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

    if (component.data.requiredUsers.length) {
      const userId = interaction.user.id;
      const username = interaction.user.username.toLowerCase();

      if (!component.data.requiredUsers.some((requiredUser: string) =>
        requiredUser === userId || requiredUser.toLowerCase() === username)) {

        await interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("interaction.no-permission"),
          context
        }));
        return false;
      }
    }

    if (!interaction.channel.isDMBased()) {
      const hasRole = await Utils.hasRole(interaction.member, component.data.requiredRoles, component.data.inherited);
      if (component.data.requiredRoles.length && !hasRole) {
        await interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("interaction.no-permission"),
          context
        }));
        return false;
      }
    }

    if (component.data.permissions.length) {
      const permissions = component.data.permissions
      if (component.data.permission) permissions.push(component.data.permission);

      const memberPermissions = interaction.member.permissionsIn(interaction.channel);
      const missingPermissions = component.data.permissions.filter((permission: bigint) => !memberPermissions.has(permission));

      if (missingPermissions.length) {
        await interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("interaction.no-permission"),
          context
        }));
        return false;
      }
    }

    if (component.data.requiredChannels.length) {
      const channelId = interaction.channel.id;
      const channelName = interaction.channel.name.toLowerCase();

      if (!component.data.requiredChannels.some((requiredChannel: string) =>
        requiredChannel === channelId || requiredChannel.toLowerCase() === channelName)) {

        const channels = component.data.requiredChannels.map((channelIdOrName: string) => {
          return channelIdOrName.match(/^\d+$/) ? `<#${channelIdOrName}>` : channelIdOrName;
        }).join(', ');

        await interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("interaction.channel-restricted"),
          variables: [
            { searchFor: "%channels%", replaceWith: channels },
          ],
          context
        }));
        return false;
      }
    }

    return true;
  }
};