import { Event, Context, Events } from '@itsmybot';
import Utils from '@utils';
import { ActivityType, Presence } from 'discord.js';

export default class PresenceUpdateEvent extends Event {
  name = Events.PresenceUpdate;
  priority = 5;

  async execute(oldPresence: Presence, newPresence: Presence) {
    if (newPresence.guild?.id !== this.manager.primaryGuildId) return;
    if (oldPresence === newPresence) return;
    if (!newPresence.member) return;

    const customStatus = newPresence.activities.find(activity => activity.type === ActivityType.Custom);
    const user = await this.manager.services.user.findOrCreate(newPresence.member);
    const context: Context = {
      content: Utils.blockPlaceholders(customStatus?.state) || 'N/A',
      member: newPresence.member,
      user: user,
      guild: newPresence.guild
    };

    this.manager.services.engine.event.emit('presenceUpdate', context);
  }
};