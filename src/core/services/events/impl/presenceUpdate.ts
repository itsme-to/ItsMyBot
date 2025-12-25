import { Event, Context, Events, Utils } from '@itsmybot';
import { ActivityType, Presence } from 'discord.js';

export default class PresenceUpdateEvent extends Event {
  name = Events.PresenceUpdate;
  priority = 5;

  async execute(oldPresence: Presence | null, newPresence: Presence) {
    if (newPresence.guild?.id !== this.manager.primaryGuildId) return;
    if (oldPresence === newPresence) return;
    if (!newPresence.member) return;

    const newCustomStatus = newPresence.activities.find(activity => activity.type === ActivityType.Custom);
    let oldStatus = null;

    if (oldPresence) {
      const oldCustomStatus = oldPresence.activities.find(activity => activity.type === ActivityType.Custom);
      oldStatus = oldCustomStatus?.state;
    }

    const user = await this.manager.services.user.findOrCreate(newPresence.member);
    const context: Context = {
      content: Utils.blockPlaceholders(newCustomStatus?.state) || 'N/A',
      member: newPresence.member,
      user: user,
      guild: newPresence.guild
    };

    const variables = [
      { name: 'old_status', value: Utils.blockPlaceholders(oldStatus) || 'N/A' }, 
      { name: 'new_status', value: Utils.blockPlaceholders(newCustomStatus?.state) || 'N/A' }
    ]

    this.manager.services.engine.event.emit('presenceUpdate', context, variables);
  }
};