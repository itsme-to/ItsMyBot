
import { Command, User, CommandBuilder, Utils } from '@itsmybot';
import { AutocompleteInteraction, ChannelType, ChatInputCommandInteraction } from 'discord.js';
import PresetsAddon from '..';
import Preset from '../models/preset.js';

export default class PresetCommand extends Command<PresetsAddon> {
  build() {
    return new CommandBuilder()
      .setName('preset')
      .using(this.addon.configs.commands.getSubsection("preset"))
      .addSubcommand(subcommand =>
        subcommand.setName('send')
          .setExecute(this.send.bind(this))
          .addStringOption(option =>
            option.setName('preset')
              .setRequired(true)
              .setAutocomplete(true))
          .addChannelOption(option =>
            option.setName('channel')
              .addChannelTypes(ChannelType.GuildText, ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread)
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName('edit')
          .setExecute(this.edit.bind(this))
          .addStringOption(option =>
            option.setName('message-link')
              .setRequired(true))
          .addStringOption(option =>
            option.setName('preset')
              .setRequired(false)
              .setAutocomplete(true)));
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const presets = this.addon.configs.presets;
    if (focusedValue) presets.filter((preset, key) => key.includes(focusedValue));
    await interaction.respond(
      presets.map((choice, key) => {
        return { name: key, value: key };
      })
    );
  }

  async send(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    if (!interaction.channel) return;

    const context = { user, guild: interaction.guild, channel: interaction.channel };

    const preset = Utils.blockPlaceholders(interaction.options.getString('preset', true));
    const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText, ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread]) || interaction.channel;
    const presetMessage = await this.addon.setupPreset(preset, channel);
    const presetConfig = this.addon.configs.presets.get(preset);
    if (!presetConfig || !presetMessage) return interaction.reply(await this.addon.lang.buildMessage({
      key: "unknown-preset",
      ephemeral: true,
      context: context
    }));

    const message = await channel.send(presetMessage);

    await Preset.create({
      id: message.id,
      channelId: channel.id,
      presetPath: preset,
      needsUpdate: presetConfig.has('update-time')
    });

    await interaction.reply(await this.addon.lang.buildMessage({
      key: "sent",
      ephemeral: true,
      context: context
    }));
  }

  async edit(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    if (!interaction.channel) return;

    const [messageId, channelId] = Utils.blockPlaceholders(interaction.options.getString('message-link', true)).split('/').slice(-2);
    const selectedPreset = interaction.options.getString('preset');

    const context = { user, guild: interaction.guild, channel: interaction.channel };

    let preset = await Preset.findOne({ where: { id: messageId } });
    if (!preset) {
      if (!selectedPreset) {
        return interaction.reply(await this.addon.lang.buildMessage({
          key: "unknown-message",
          ephemeral: true,
          context: context
       }));
      } else {
        const presetConfig = this.addon.configs.presets.get(selectedPreset);
        preset = await Preset.create({ id: messageId, channelId: channelId, presetPath: selectedPreset, needsUpdate: presetConfig?.getBoolOrNull('update-time') || false });
      }
    }

    const presetConfig = this.addon.configs.presets.get(preset.presetPath);
    if (!presetConfig) return interaction.reply(await this.addon.lang.buildMessage({
      key: "unknown-preset",
      ephemeral: true,
      context: context
    }));

    const message = await this.addon.getMessage(preset);
    if (!message) {
      Preset.destroy({ where: { id: messageId } });
      return interaction.reply(await this.addon.lang.buildMessage({
        key: "unknown-message",
        ephemeral: true,
        context: context
      }))
    };

    await preset.updateData(preset.presetPath, presetConfig?.getBoolOrNull('update-time') || false);
    const presetMessage = await this.addon.setupPreset(preset.presetPath, message.channel);
    if (!presetMessage) return interaction.reply(await this.addon.lang.buildMessage({
      key: "unknown-preset",
      ephemeral: true,
      context: context
    }));

    message.edit(presetMessage)
    interaction.reply(await this.addon.lang.buildMessage({
      key: "edited",
      ephemeral: true,
      context: context
    }));
  }
}