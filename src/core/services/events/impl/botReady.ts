import { Manager, Event, Events, Utils } from '@itsmybot';
import { Guild } from 'discord.js';

export default class BotReadyEvent extends Event {
  name = Events.BotReady;
  once = true;

  async execute(primaryGuild: Guild) {
    const presence = this.manager.configs.config.getSubsection("presence");
    const activities = presence.getSubsections("activities");
    const status = Utils.getPresenceStatus(presence.getString("status"))
    let currentIndex = 0;

    if (status) this.manager.client.user.setStatus(status);
    else {
      this.logger.warn(`The status "${status}" is not valid. Must be one of "invisible", "dnd", "idle" or "online".`);
      this.manager.client.user.setStatus("online");
    }

    async function updateActivity(manager: Manager) {
      if (currentIndex >= activities.length) currentIndex = 0;
      const activity = activities[currentIndex];
      const text = await Utils.applyVariables(activity.getString("text"), [], {
        guild: manager.client.guilds.cache.get(manager.primaryGuildId)!
      });

      if (!text) return manager.logger.warn(`Activity text is empty. Skipping...`);

      const type = Utils.getActivityType(activity.getString("type"));
      manager.client.user.setActivity(text, { type: type });

      currentIndex++;
    };
    
    if (activities.length === 0) return;
    updateActivity(this.manager);
    setInterval(() => updateActivity(this.manager), presence.getNumber("interval") * 1000);
  }
};
