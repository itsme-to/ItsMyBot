import { Command, User, CommandBuilder, Utils, Config } from '@itsmybot';
import StatsChannelAddon from '..';
import { ChannelType, PermissionFlagsBits, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

export default class StatsChannelCommand extends Command<StatsChannelAddon> {
  build() {
    return new CommandBuilder()
      .setName('stats-channel')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
      .addSubcommand(subcommand =>
        subcommand
          .setName('create')
          .setExecute(this.create.bind(this))
          .addStringOption(option =>
            option
              .setName('name')
              .setRequired(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('rename')
          .setExecute(this.rename.bind(this))
          .addStringOption(option =>
            option
              .setName('channel')
              .setRequired(true)
              .setAutocomplete(true))
          .addStringOption(option =>
            option
              .setName('name')
              .setRequired(true)))
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const channels = this.addon.configs.config.getSubsections("channels")
    if (focusedValue) channels.filter((channel) => channel.getString('name').includes(focusedValue));
    await interaction.respond(
      channels.map((choice) => {
        return { name: choice.getString('name'), value: choice.getString('id') };
      })
    );
  }

  async create(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const rawName = Utils.blockPlaceholders(interaction.options.getString("name", true));
    const name = await Utils.applyVariables(rawName, [], { guild: interaction.guild })

    const createdChannel = await interaction.guild.channels.create({
      name: name,
      type: ChannelType.GuildVoice,
      parent: this.addon.configs.config.getStringOrNull("category"),
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.Connect]
        }
      ]
    });

    const channels = this.addon.configs.config.getSubsections("channels");
    const config = new Config(this.logger, this.addon.configs.config.filePath)
    config.set("id", createdChannel.id);
    config.set("name", rawName);
    channels.push(config);

    this.addon.configs.config.setFileContent("channels", channels);

    await interaction.reply(await this.addon.lang.buildMessage({
      key: "channel-created",
      ephemeral: true,
      context: {
        user,
        guild: interaction.guild,
        content: name,
        channel: createdChannel
      }
    }));
  }

  async rename(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const channel = Utils.findChannel(Utils.blockPlaceholders(interaction.options.getString("channel", true)));
    if (!channel) return

    const rawRename = Utils.blockPlaceholders(interaction.options.getString("name", true));
    const rename = await Utils.applyVariables(rawRename, [], { guild: interaction.guild })
    channel.setName(rename);

    const channelConfig = this.addon.configs.config.getSubsections("channels").find(c => c.getString("id") === Utils.blockPlaceholders(interaction.options.getString("channel", true)));
    if (!channelConfig) return;

    await channelConfig.setFileContent("name", rawRename);

    await interaction.reply(await this.addon.lang.buildMessage({
      key: "channel-renamed",
      ephemeral: true,
      variables: [
        { searchFor: "%old_name%", replaceWith: channel.name },
        { searchFor: "%new_name%", replaceWith: rawRename }
      ],
      context: {
        user,
        guild: interaction.guild,
        content: rename,
        channel: channel
      }
    }));
  }
}