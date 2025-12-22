
import { Command, User, CommandBuilder, Utils } from '@itsmybot';
import { AutocompleteInteraction, ChannelType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import PresetsAddon from '..';
import Preset from '../models/preset.js';

export default class PresetCommand extends Command<PresetsAddon> {
  build() {
    return new CommandBuilder()
      .setName('preset')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
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
              .setRequired(false)));
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
    
    const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText, ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread]) || interaction.channel;
    const context = { user, guild: channel.guild, channel };

    const presetId = Utils.blockPlaceholders(interaction.options.getString('preset', true));
    
    const presetConfig = this.addon.configs.presets.get(presetId);
    if (!presetConfig) return interaction.reply(await this.addon.lang.buildMessage({
      key: "unknown-preset",
      ephemeral: true,
      context: context
    }));

    const presetMessage = await Utils.setupMessage({
      config: presetConfig,
      context: context
    });

    const message = await channel.send(presetMessage);

    await Preset.create({
      id: message.id,
      channelId: channel.id,
      presetPath: presetId
    });

    await interaction.reply(await this.addon.lang.buildMessage({
      key: "sent",
      ephemeral: true,
      context: context
    }));
  }
}