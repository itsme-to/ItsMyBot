import { Events, Message } from 'discord.js';
import { Event } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';

export default class MessageDeleteEvent extends Event<PresetsAddon> {
  name = Events.MessageDelete;

  async execute(message: Message) {
    if (!message.guild || message.guild.id !== this.manager.primaryGuildId) return;
    const preset = await Preset.findOne({ where: { id: message.id } });
    if (!preset) return;

    await Preset.destroy({ where: { id: message.id } });
  }
};
