import { Addon, ConfigFile, Utils } from '@itsmybot';
import { Guild } from 'discord.js';
import DefaultConfig from './resources/config.js';

interface StatsChannelConfig {
  config: ConfigFile
}

export default class StatsChannelAddon extends Addon {
  version = "1.2.0"
  authors = ["Théo"]
  description = "Create and manage channels for your stats"
  website = "https://docs.itsmy.studio/itsmybot/addons/statschannel"

  configs: StatsChannelConfig = {} as StatsChannelConfig;

  async load() {
    this.configs.config = await this.createConfig('config.yml', DefaultConfig);
  }

  async updateChannels(guild: Guild) {
    const channels = this.configs.config.getSubsections("channels");

    await Promise.all(channels.map(async (channel) => {
      const id = channel.getString("id");
      if (id.startsWith("_")) return;

      const discordChannel = Utils.findChannel(id, guild);
      if (!discordChannel) {
        this.logger.warn(`Channel ${id} not found`);
        return;
      }

      const name = await Utils.applyVariables(channel.getString("name"), [], { guild: discordChannel.guild })

      if (discordChannel.name !== name) {
        await discordChannel.setName(name);
      }
    }));
  }
}