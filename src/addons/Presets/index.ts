import { Addon, ConfigFile, LangDirectory, Utils } from '@itsmybot';
import { GuildTextBasedChannel, TextChannel, Collection } from 'discord.js';

import CommandsConfig from './resources/commands.js';
import PresetConfig from './resources/preset.js';
import PresetModel from './models/preset.js';

interface PresetsConfig {
  commands: ConfigFile
  presets: Collection<string, ConfigFile>
}

export default class PresetsAddon extends Addon {
  version = "1.4.4"
  authors = ["Théo"]
  description = "A simple addon that create messages"
  website = "https://builtbybit.com/resources/28488/"

  configs: PresetsConfig = {} as PresetsConfig;
  lang: LangDirectory
  updateCount = 0;

  async load() {
    this.configs.commands = await this.createConfig('commands.yml', CommandsConfig);
    this.configs.presets = await this.createConfigSection('presets', PresetConfig);
    this.lang = await this.createLang('en-US');
  }

  async getMessage(preset: PresetModel) {
    try {
      const channel = await this.manager.client.channels.fetch(preset.channelId)
      if (!channel) return
      if (!(channel instanceof TextChannel)) return

      const message = await channel.messages.fetch(preset.id)
      return message;
    } catch (e) {
      return;
    }
  }

  async setupPreset(presetRelativePath: string, channel: GuildTextBasedChannel) {
    const preset = this.configs.presets.get(presetRelativePath);
    if (!preset) return;

    return await Utils.setupMessage({
      config: preset,
      context: {
        guild: channel.guild,
        channel: channel
      }
    });
  }
}