import { Event, Events } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';
import { Guild } from 'discord.js';


export default class BotReadyEvent extends Event<PresetsAddon> {
  name = Events.BotReady;

  async execute(primaryGuild: Guild) {
    const presets = await Preset.findAll();

    await Promise.all(presets.map(async preset => {
      const message = await this.addon.getMessage(preset);
      if (!message) return Preset.destroy({ where: { id: preset.id } });
    }));
  }
};