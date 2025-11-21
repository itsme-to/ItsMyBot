import { Events, Message } from 'discord.js';
import { Event } from '@itsmybot';
import PresetsAddon from '..';
import Preset from '../models/preset.js';

export default class MessageDeleteEvent extends Event<PresetsAddon> {
  name = Events.MessageDelete;

  async execute(message: Message) {
    const preset = await Preset.findOne({ where: { id: message.id } });
    if (!preset) return;

    await preset.destroy();
  }
};
