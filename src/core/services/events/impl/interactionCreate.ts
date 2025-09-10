import { Command, Event, User, Events, Context, ResolvableInteraction, Utils, CommandSubcommandGroupBuilder } from '@itsmybot';
import { ChatInputCommandInteraction, Interaction, MessageComponentInteraction } from 'discord.js';

export default class InteractionCreateEvent extends Event {
  name = Events.InteractionCreate;

  public async execute(interaction: Interaction<'cached'>) {

    const user = interaction.member
      ? await this.manager.services.user.findOrCreate(interaction.member)
      : await this.manager.services.user.findOrNull(interaction.user.id) as User;

    if (interaction.isChatInputCommand() || interaction.isAutocomplete() || interaction.isMessageComponent()) {
      const interactionComponent = this.manager.services.interaction.resolveInteraction(interaction);
      if (!interactionComponent) return;

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
    interaction: ChatInputCommandInteraction<'cached'> | MessageComponentInteraction<'cached'>,
    component: ResolvableInteraction,
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
      let execute = component.execute;

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
              execute = group.execute;
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
      await execute(interaction as any, user);
    } catch (error: any) {
      this.logger.error(`Error executing the interaction '${(component.data && 'name' in component.data ? (component.data as any).name : 'unknown')}'`, error);
    }

    component.data.cooldown.setCooldown(interaction.user.id);
  }

  async checkRequirements(interaction: ChatInputCommandInteraction<'cached'> | MessageComponentInteraction<'cached'>, component: ResolvableInteraction, user: User) {
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