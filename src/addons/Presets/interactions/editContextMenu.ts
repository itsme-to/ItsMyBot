import { LabelBuilder, MessageContextMenuCommandInteraction, ModalBuilder, PermissionFlagsBits, StringSelectMenuBuilder, TextInputBuilder } from 'discord.js';
import { User, ContextMenu, ContextMenuBuilder } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';

export default class EditContextMenuCommand extends ContextMenu<PresetsAddon> {
  build() {
    return new ContextMenuBuilder()
      .setName(this.addon.lang.getString("commands.preset.context-menu"))
      .setType(3)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  }

  async execute(interaction: MessageContextMenuCommandInteraction<'cached'>, user: User) {
    if (!interaction.guild || !interaction.channel) return;

    const message = interaction.targetMessage;
    const preset = await Preset.findOne({ where: { id: message.id } });

    const context = { user, guild: interaction.guild, channel: interaction.channel };

    if (message.author.id !== this.manager.client.user.id) {
      return interaction.reply(await this.addon.lang.buildMessage({
        key: "not-bot-message",
        ephemeral: true,
        context: context
      }));
    }

    if (this.addon.configs.presets.size === 0) {
      return interaction.reply(await this.addon.lang.buildMessage({
        key: "unknown-preset",
        ephemeral: true,
        context: context
      }));
    }

    const label = new LabelBuilder()
      .setLabel(this.addon.lang.getString("modals.edit.label"))
      .setDescription(this.addon.lang.getString("modals.edit.description"))

    if (this.addon.configs.presets.size > 25) {
      const textInput = new TextInputBuilder()
        .setCustomId('preset')
        .setPlaceholder(this.addon.lang.getString("modals.edit.text-input.placeholder"))
        .setRequired(true)
      
      if (preset) {
        textInput.setValue(preset.presetPath);
      }
      
      label.setTextInputComponent(textInput);
    } else {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('preset')
        .setPlaceholder(this.addon.lang.getString("modals.edit.select-menu.placeholder"))
        .setMaxValues(1)
        .setOptions(
          this.addon.configs.presets.map((presetConfig, key) => {
            return {
              label: key,
              value: key,
              default: preset ? preset.presetPath === key : false
            }
          })
        )
        .setRequired(true);
      
      label.setStringSelectMenuComponent(selectMenu);
    }


    const editModal = new ModalBuilder()
      .setCustomId(`presets-edit_${message.channel.id}_${message.id}`)
      .setTitle(this.addon.lang.getString("modals.edit.title"))
      .addLabelComponents(label);

    await interaction.showModal(editModal);
  }
}
