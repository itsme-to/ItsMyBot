import { Command, Event, User, Events, Context, ResolvableInteraction, CommandSubcommandGroupBuilder } from '@itsmybot';
import { ChatInputCommandInteraction, ContextMenuCommandInteraction, Interaction, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';

export default class InteractionCreateEvent extends Event {
  name = Events.InteractionCreate;

  public async execute(interaction: Interaction<'cached'>) {

    const user = interaction.member
      ? await this.manager.services.user.findOrCreate(interaction.member)
      : await this.manager.services.user.findOrNull(interaction.user.id) as User;

    if (interaction.isChatInputCommand() || interaction.isAutocomplete() || interaction.isModalSubmit() || interaction.isContextMenuCommand() || interaction.isMessageComponent()) {
      const interactionComponent = this.manager.services.interaction.resolveInteraction(interaction);
      if (!interactionComponent) {
        if (interaction.isButton()) {
          return this.manager.client.emit(Events.ButtonClick, interaction, user);
        }
        if (interaction.isAnySelectMenu()) {
          return this.manager.client.emit(Events.SelectMenu, interaction, user);
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
        this.handleInteraction(interaction, interactionComponent, user);
      }
    }
  }

  private async handleInteraction(
    interaction: ChatInputCommandInteraction<'cached'> | ContextMenuCommandInteraction<'cached'> | MessageComponentInteraction<'cached'> | ModalSubmitInteraction<'cached'>,
    component: ResolvableInteraction,
    user: User
  ) {
    if (!component.data.public && interaction.guildId && interaction.guildId !== this.manager.primaryGuildId) {
      return interaction.reply(await this.manager.lang.buildMessage({
        key: "only-in-primary-guild",
        ephemeral: true,
        context: { user }
      }));
    }

    const requirementsMet = await this.checkRequirements(interaction, component, user);
    if (!requirementsMet) return;

    try {
      let executeComponent: any = component;

      if (component instanceof Command) {
        if (!interaction.isChatInputCommand()) return;
        if (component.data.subcommands?.length) {
          let subcommands = component.data.subcommands;
          const subcommandGroup = interaction.options.getSubcommandGroup();

          if (subcommandGroup) {
            const group = subcommands.find((subcommand) => subcommand.name === subcommandGroup);
            if (!group || !(group instanceof CommandSubcommandGroupBuilder)) return;

            subcommands = group.subcommands;
            if (group.execute) {
              executeComponent = group;
            }
          }

          const subcommand = subcommands.find((subcommand) => subcommand.name === interaction.options.getSubcommand());
          if (!subcommand) return;

          if (subcommand.execute) {
            await subcommand.execute(interaction, user);
            return;
          } 
        }
      }
      await executeComponent.execute(interaction, user);
    } catch (error: any) {
      this.logger.error(`Error executing the interaction '${(component.data && 'name' in component.data ? (component.data as any).name : 'unknown')}'`, error);
    }

    component.data.cooldown.setCooldown(interaction.user.id);
  }

  async checkRequirements(interaction: ChatInputCommandInteraction<'cached'> | ContextMenuCommandInteraction<'cached'> | MessageComponentInteraction<'cached'> | ModalSubmitInteraction<'cached'>, component: ResolvableInteraction, user: User) {
    const context: Context = {
      user: user,
      member: interaction.member,
      guild: interaction.guild,
      channel: interaction.channel || undefined
    }

    if (component.data.cooldown.isOnCooldown(interaction.user.id)) {
      await interaction.reply(await this.manager.lang.buildMessage({
        key: "in-cooldown",
        ephemeral: true,
        variables: [
          { searchFor: "%cooldown%", replaceWith: component.data.cooldown.endsAtFormatted(interaction.user.id) },
        ],
        context
      }));
      return false;
    }

    const isMet = await this.manager.services.condition.meetsConditions(component.conditions, context, []);

    if (!isMet) {
      await interaction.reply(await this.manager.lang.buildMessage({
        key: "no-permission",
        ephemeral: true,
        context
      }));
      return false;
    }

    return true;
  }
};