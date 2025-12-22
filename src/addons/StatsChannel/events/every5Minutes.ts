import { Event, Events } from '@itsmybot';
import EmbedsAddon from '..';
import { Guild } from 'discord.js';

export default class Every5MinutesEvent extends Event<EmbedsAddon> {
  name = Events.EveryMinute;
  every = 5

  async execute(primaryGuild: Guild) {
    this.addon.updateChannels(primaryGuild);
  }
};