import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { Command, User, CommandBuilder, Utils, Pagination } from '@itsmybot';
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
        { searchFor: "%addon_website%", replaceWith: addon.website || '' },
        { searchFor: "%addon_has_description%", replaceWith: addon.description ? true : false },
        { searchFor: "%addon_has_website%", replaceWith: addon.website ? true : false }
      ];

      addons.push({
        label: addon.name,
        emoji: status,
        variables: variables,
        description: addon.description,
      });
    }

    new Pagination(interaction, addons, this.manager.configs.lang.getSubsection("addon.list"))
      .setContext({
        user: user,
        guild: interaction.guild || undefined,
        channel: interaction.channel || undefined
      })
      .send();
  }

  async enableOrDisable(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const subcommand = interaction.options.getSubcommand();
    const lang = this.manager.configs.lang;

    const addonName = Utils.blockPlaceholders(interaction.options.getString("addon", true));
    const addon = await AddonModel.findOne({ where: { name: addonName } });

    if (!addon) {
      return interaction.reply(await Utils.setupMessage({
        config: lang.getSubsection("addon.not-found"),
        variables: [
          { searchFor: "%addon_name%", replaceWith: addonName }
        ],
        context: {
          user: user,
          guild: interaction.guild || undefined,
          channel: interaction.channel || undefined
        }
      }));
    }

    if (addon.enabled && subcommand === "enable" || !addon.enabled && subcommand === "disable") {
      return interaction.reply(await Utils.setupMessage({
        config: lang.getSubsection(`addon.already-${subcommand}d`),
        variables: [
          { searchFor: "%addon_name%", replaceWith: addonName }
        ],
        context: {
          user: user,
          guild: interaction.guild || undefined,
          channel: interaction.channel || undefined
        }
      }));
    }

    await addon.update({ enabled: subcommand === "enable" ? true : false });

    interaction.reply(await Utils.setupMessage({
      config: lang.getSubsection(`addon.${subcommand}d`),
      variables: [
        { searchFor: "%addon_name%", replaceWith: addonName }
      ],
      context: {
        user: user,
        guild: interaction.guild || undefined,
        channel: interaction.channel || undefined
      }
    }));
  }
}
