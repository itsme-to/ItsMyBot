import { ComponentType, Events, Interaction } from 'discord.js';
import { Event, Utils } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';

export default class InteractionCreateEvent extends Event<PresetsAddon> {
  name = Events.InteractionCreate;

  async execute(interaction: Interaction) {
    if (!interaction.guild || !interaction.channel) return;
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('presets-edit_')) return;

    const [, channelId, messageId] = interaction.customId.split('_');
    const message = await this.addon.fetchMessage(channelId, messageId);

    if (!message) {
      return interaction.reply(await this.addon.lang.buildMessage({
        key: "unknown-message",
        ephemeral: true,
        context: { guild: interaction.guild, channel: interaction.channel }
      }));
    }

    const field = interaction.fields.fields.get('preset')!
    let presetPath
    let presetConfig;

    if (field.type === ComponentType.TextInput) {
      presetPath = Utils.blockPlaceholders(field.value);
      presetConfig = this.addon.configs.presets.get(presetPath);
    } else if (field.type === ComponentType.StringSelect) {
      presetPath = Utils.blockPlaceholders(field.values[0]);
      presetConfig = this.addon.configs.presets.get(presetPath);
    }

    if (!presetConfig || !presetPath) {
      return interaction.reply(await this.addon.lang.buildMessage({
        key: "unknown-preset",
        ephemeral: true,
        context: { guild: interaction.guild, channel: interaction.channel }
      }));
    }

    const preset = await Preset.findOrCreate({
      where: { id: message.id },
      defaults: {
        id: message.id,
        channelId: message.channel.id,
        presetPath: presetPath
      }
    }).then(([preset]) => preset);

    if (preset.presetPath !== presetPath) {
      preset.presetPath = presetPath;
      await preset.save();
    }

    const presetMessage = await Utils.setupMessage({
      config: presetConfig,
      context: {
        guild: message.channel.guild,
        channel: message.channel
      }
    });

    await message.edit(presetMessage);
    await interaction.reply(await this.addon.lang.buildMessage({
      key: "edited",
      ephemeral: true,
      context: { guild: interaction.guild, channel: interaction.channel },
      variables: [{ name: "preset_path", value: presetPath }]
    }));
  }
};
