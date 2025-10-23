import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MessageActionRowComponentBuilder, TextDisplayBuilder } from 'discord.js';
import { Command, User, CommandBuilder, Utils, Pagination, MessageComponentBuilder } from '@itsmybot';
import AddonModel from '../../addons/addon.model.js';

export default class AddonCommand extends Command {
  build() {
    return new CommandBuilder()
      .setName('addons')
      .using(this.manager.configs.commands.getSubsection("addons"))
      .setPublic()
      .addSubcommand(subcommand =>
        subcommand
          .setName('list')
          .setExecute(this.list.bind(this)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('enable')
          .setExecute(this.enableOrDisable.bind(this))
          .addStringOption(option =>
            option.setName("addon")
              .setRequired(true)
              .setAutocomplete(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('disable')
          .setExecute(this.enableOrDisable.bind(this))
          .addStringOption(option =>
            option.setName("addon")
              .setRequired(true)
              .setAutocomplete(true))) 
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const focusedValue = interaction.options.getFocused();
    const enabled = (subcommand == "disable")

    let allAddons = await AddonModel.findAll({
      where: { enabled: enabled }
    });

    if (focusedValue) {
      allAddons = allAddons.filter((addon: { name: string; }) => addon.name.includes(focusedValue));
    }

    const choices = allAddons.map((addon: { name: string; }) => {
      return { name: addon.name, value: addon.name };
    });

    await interaction.respond(choices);
  }

  async list(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const addons = []
    for (const [_, addon] of this.manager.services.addon.addons) {
      const status = addon.enabled ? '✅' : '❌';
      const variables = [
        { searchFor: "%addon_status%", replaceWith: status },
        { searchFor: "%addon_name%", replaceWith: addon.name },
        { searchFor: "%addon_version%", replaceWith: addon.version },
        { searchFor: "%addon_description%", replaceWith: addon.description },
        { searchFor: "%addon_authors%", replaceWith: addon.authors.join(', ') },
        { searchFor: "%addon_website%", replaceWith: addon.website || '' }
      ];

      addons.push({
        label: addon.name,
        emoji: status,
        item: addon,
        variables: variables,
        description: addon.description,
      });
    }

    new Pagination(interaction, addons)
      .setContext({
        user: user,
        guild: interaction.guild || undefined,
        channel: interaction.channel || undefined
      })
      .setType('select_menu')
      .setFormat(async (items, variables, context) => {
        const components: MessageComponentBuilder[] = [];
        components.push(new TextDisplayBuilder()
          .setContent(this.manager.lang.getString("addons.title")));

        for (const item of items) {
          const container = new ContainerBuilder()
            .setAccentColor(Utils.getColorFromString(this.manager.configs.config.getString("default-color")))
            .addTextDisplayComponents(
              new TextDisplayBuilder()
                .setContent(await this.manager.lang.getParsedString("addons.info", variables, context)));

          if (item.item?.description) {
            container.addTextDisplayComponents(
              new TextDisplayBuilder()
                .setContent(item.item.description));
          }

          if (item.item?.website) {
            container.addActionRowComponents(
              new ActionRowBuilder<MessageActionRowComponentBuilder>()
                .addComponents(
                new ButtonBuilder()
                  .setLabel(this.manager.lang.getString("addons.website"))
                  .setEmoji('🌐')
                  .setStyle(ButtonStyle.Link)
                  .setURL(item.item.website)));
          }

          components.push(container);
        }

        return components;
      })
      .send();
  }

  async enableOrDisable(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const subcommand = interaction.options.getSubcommand();
    const addonName = Utils.blockPlaceholders(interaction.options.getString("addon", true));
    const addon = await AddonModel.findOne({ where: { name: addonName } });
    
    const variables = [
      { searchFor: "%addon_name%", replaceWith: addonName }
    ];

    const context = {
      user: user,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined
    };

    if (!addon) {
      return interaction.reply(await this.manager.lang.buildMessage({
        key: 'messages.addon.not-found',
        ephemeral: true,
        variables,
        context
      }));
    }

    if (addon.enabled && subcommand === "enable" || !addon.enabled && subcommand === "disable") {
      return interaction.reply(await this.manager.lang.buildMessage({
        key: `messages.addon.already-${subcommand}d`,
        ephemeral: true,
        variables,
        context
      }));
    }

    await addon.update({ enabled: subcommand === "enable" ? true : false });

    interaction.reply(await this.manager.lang.buildMessage({
      key: `messages.addon.${subcommand}d`,
      ephemeral: true,
      variables,
      context
    }));
  }
}
