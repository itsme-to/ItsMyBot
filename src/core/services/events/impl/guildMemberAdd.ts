import { Event, Events } from '@itsmybot';
import { GuildMember } from 'discord.js';

export default class GuildMemberAddEvent extends Event {
  name = Events.GuildMemberAdd;
  priority = 5;

  async execute(member: GuildMember) {
    if (member.guild.id !== this.manager.primaryGuildId) return;
    const user = await this.manager.services.user.findOrCreate(member);

    if (!member.pending) {
      const context = {
        member: member,
        user: user,
        guild: member.guild,
        content: member.displayName
      };

      this.manager.services.engine.event.emit('guildMemberAdd', context);
    }
  }
};