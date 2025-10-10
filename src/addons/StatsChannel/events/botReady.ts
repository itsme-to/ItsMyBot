import { Event, Events } from '@itsmybot';
import StatsChannelAddon from '..';
import { Guild } from 'discord.js';

export default class BotReadyEvent extends Event<StatsChannelAddon> {
  name = Events.BotReady;
  once = true;

  async execute(primaryGuild: Guild) {
    this.addon.updateChannels(primaryGuild);
  }
};