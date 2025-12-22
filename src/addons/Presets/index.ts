import { Addon, ConfigFile } from '@itsmybot';
import { TextChannel, Collection } from 'discord.js';

import PresetConfig from './resources/preset.js';

interface PresetsConfig {
  presets: Collection<string, ConfigFile>
}

export default class PresetsAddon extends Addon {
  version = "2.0.0"
  authors = ["Théo"]
  description = "An addon to create and manage preset messages."
  website = "https://docs.itsmy.studio/itsmybot/addons/presets"

  configs: PresetsConfig = {} as PresetsConfig;
  updateCount = 0;

  async load() {
    this.configs.presets = await this.createConfigSection('presets', PresetConfig);
  }

  async fetchMessage(channelId: string, messageId: string) {
    try {
      const channel = await this.manager.client.channels.fetch(channelId)
      if (!channel) return
      if (!(channel instanceof TextChannel)) return

      const message = await channel.messages.fetch(messageId)
      return message;
    } catch (e) {
      return;
    }
  }
}