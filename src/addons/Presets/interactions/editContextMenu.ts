import { MessageContextMenuCommandInteraction } from 'discord.js';
import { User, ContextMenu, Utils, ContextMenuBuilder, } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';

export default class EditContextMenuCommand extends ContextMenu<PresetsAddon> {
  build() {
    return new ContextMenuBuilder()
      .setName(this.addon.configs.commands.getString("preset.context-menu"))
      .setType(3)
      .using(this.addon.configs.commands.getSubsection("preset"))
  }

  async execute(interaction: MessageContextMenuCommandInteraction<'cached'>, user: User) {
    if (!interaction.guild || !interaction.channel) return;
    const lang = this.addon.configs.lang;

    const message = interaction.targetMessage;
    const preset = await Preset.findOne({ where: { id: message.id } });
    if (!preset) return interaction.reply(await Utils.setupMessage({
      config: lang.getSubsection("unknown-message"),
      context: {
        user: user,
        guild: interaction.guild,
        channel: interaction.channel
      }
    }));

    const presetMessage = await this.addon.setupPreset(preset.presetPath, message.channel);
    if (!presetMessage) return interaction.reply(await Utils.setupMessage({
      config: lang.getSubsection("unknown-preset"),
      context: {
        user: user,
        guild: interaction.guild,
        channel: interaction.channel
      }
    }));

    const presetConfig = this.addon.configs.presets.get(preset.presetPath);
    if (presetConfig && presetConfig.has('update-time')) {
      await preset.updateData(preset.presetPath, true);
    }

    message.edit(presetMessage)
    interaction.reply(await Utils.setupMessage({
      config: lang.getSubsection("edited"),
      context: {
        guild: interaction.guild,
        user: user,
        message: message,
        channel: interaction.channel
      }
    }));
  }
}
