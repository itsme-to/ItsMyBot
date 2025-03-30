import { hyperlink, hideLinkEmbed, AutocompleteInteraction } from 'discord.js';
import { CommandInteraction } from '@contracts';
import Utils from '@utils';
import { CommandBuilder } from '@builders';
import { Pagination } from '@utils';
import { Command, Addon, User } from '@itsmybot';
import AddonModel from '../../addons/addon.model.js';

export default class AddonCommand extends Command {
  build() {
    const command = this.manager.configs.commands.getSubsection("addons");

    return new CommandBuilder()
      .setName('addons')
      .using(command)
      .setPublic()
      .addSubcommand(subcommand =>
        subcommand
          .setName('list')
          .setDescription(command.getString("subcommands.list.description"))
          .setExecute(this.list.bind(this))
        )
      .addSubcommand(subcommand =>
        subcommand
          .setName('enable')
          .setDescription(command.getString("subcommands.enable.description"))
          .setExecute(this.enableOrDisable.bind(this))
          .addStringOption(option =>
            option.setName("addon")
              .setDescription(command.getString("subcommands.enable.options.addon"))
              .setRequired(true)
              .setAutocomplete(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('disable')
          .setDescription(command.getString("subcommands.disable.description"))
          .setExecute(this.enableOrDisable.bind(this))
          .addStringOption(option =>
            option.setName("addon")
              .setDescription(command.getString("subcommands.disable.options.addon"))
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

  async list(interaction: CommandInteraction, user: User) {
    const lang = this.manager.configs.lang;
    const addonInfo = lang.getString("addon.information");

    async function getAddonDetails(addon: Addon) {
      const status = addon.enabled ? '✅' : '❌';

      const info = await Utils.applyVariables(addonInfo, [
        { searchFor: "%status%", replaceWith: status },
        { searchFor: "%name%", replaceWith: addon.name },
        { searchFor: "%version%", replaceWith: addon.version },
        { searchFor: "%description%", replaceWith: addon.description },
        { searchFor: "%authors%", replaceWith: addon.authors.join(', ') },
        { searchFor: "%website%", replaceWith: hyperlink("Website", hideLinkEmbed(addon.website || '')) },
        { searchFor: "%has_description%", replaceWith: addon.description ? true : false },
        { searchFor: "%has_website%", replaceWith: addon.website ? true : false }
      ]);

      return {
        label: addon.name,
        emoji: status,
        message: Utils.removeHiddenLines(info)
      };
    };

    const addons = await Promise.all(this.manager.services.addon.addons.map(getAddonDetails));

    new Pagination(interaction, addons, lang.getSubsection("addon.list"))
      .setContext({
        user: user,
        guild: interaction.guild,
        channel: interaction.channel || undefined
      })
      .send();
  }

  async enableOrDisable(interaction: CommandInteraction, user: User) {
    const subcommand = interaction.options.getSubcommand();
    const lang = this.manager.configs.lang;

    const addonName = interaction.options.getString("addon", true);
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
