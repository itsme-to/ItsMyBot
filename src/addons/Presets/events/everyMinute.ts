import { Event, Events, Utils } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';
import { Guild } from 'discord.js';

export default class EveryMinuteEvent extends Event<PresetsAddon> {
  name = Events.EveryMinute

  async execute(primaryGuild: Guild) {
    const presets = await Preset.findAll();
    this.addon.updateCount++;

    await Promise.all(presets.map(async preset => {
      const presetConfig = this.addon.configs.presets.get(preset.presetPath);
      if (!presetConfig) {
        this.addon.logger.warn(`Tried to update message for preset path "${preset.presetPath}", but preset config not found, deleting from database.`);
        await preset.destroy();
        return;
      };

      const updateTime = presetConfig.getNumberOrNull('update-time');
      if (!updateTime) return;

      if (this.addon.updateCount % updateTime !== 0) return;

      const message = await this.addon.fetchMessage(preset.channelId, preset.id);
      if (!message) {
        this.addon.logger.warn(`Tried to update message, but message not found, deleting from database.`);
        await preset.destroy();
        return;
      };

      const presetMessage = await Utils.setupMessage({
        config: presetConfig,
        context: {
          guild: message.channel.guild,
          channel: message.channel
        }
      });

      await message.edit(presetMessage);
    }));
  }
};