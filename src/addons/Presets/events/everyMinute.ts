import { Event, Events } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';
import { Guild } from 'discord.js';

export default class EveryMinuteEvent extends Event<PresetsAddon> {
  name = Events.EveryMinute

  async execute(primaryGuild: Guild) {
    const presets = await Preset.findAll({ where: { needsUpdate: true } });
    this.addon.updateCount++;


    await Promise.all(presets.map(async preset => {
      const presetConfig = this.addon.configs.presets.get(preset.presetPath);
      if (!presetConfig) {
        this.addon.logger.warn(`No config found for preset path "${preset.presetPath}", deleting.`);
        await Preset.destroy({ where: { id: preset.id } });
        return;
      };

      const updateTime = presetConfig.getNumberOrNull('update-time') || 60;
      if (this.addon.updateCount % updateTime !== 0) return;

      const message = await this.addon.getMessage(preset);
      if (!message) {
        this.addon.logger.warn(`Message not found for preset path "${preset.presetPath}", deleting.`);
        await Preset.destroy({ where: { id: preset.id } });
        return;
      };

      const presetMessage = await this.addon.setupPreset(preset.presetPath, message.channel);
      if (!presetMessage) {
        this.addon.logger.warn(`Preset not found for preset path "${preset.presetPath}", deleting.`);
        await Preset.destroy({ where: { id: preset.id } });
        return;
      }

      await message.edit(presetMessage);
    }));
  }
};