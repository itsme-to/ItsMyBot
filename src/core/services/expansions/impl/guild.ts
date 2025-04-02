import { Expansion, Context } from '@itsmybot';
import { channelMention, roleMention, time, ChannelType } from 'discord.js';

export default class GuildExpansion extends Expansion {
  name = 'guild';

  async onRequest(context: Context, placeholder: string) {
    if (!context.guild) return 
  
    switch (placeholder) {
      case 'id':
        return context.guild.id;
      case 'name':
        return context.guild.name;
      case 'icon':
        return context.guild.iconURL({ forceStatic: false }) || "https://cdn.discordapp.com/embed/avatars/0.png";
      case 'boosts':
        return context.guild.premiumSubscriptionCount?.toString() || "0";
      case 'level':
        return context.guild.premiumTier.toString();
      case 'create_date':
        return time(Math.round(context.guild.createdTimestamp / 1000), "D");
      case 'afk_channel':
        return context.guild.afkChannelId ? channelMention(context.guild.afkChannelId) : "None";
      case 'afk_timeout':
        return context.guild.afkTimeout.toString();
      case 'verification_level':
        return context.guild.verificationLevel.toString();
      case 'create_date':
        return time(Math.round(context.guild.createdTimestamp / 1000), "D");
      case 'members':
        return context.guild.members.cache.filter((m) => !m.user.bot).size.toString();
      case 'bots':
        return context.guild.members.cache.filter((m) => m.user.bot).size.toString();
      case 'users':
        return context.guild.memberCount.toString();
      case 'roles':
        return context.guild.roles.cache.size.toString();
      case 'roles_list':
        return context.guild.roles.cache.map((r) => roleMention(r.id)).join(", ");
      case 'channels':
        return context.guild.channels.cache.filter((c) => c.type !== ChannelType.GuildCategory).size.toString();
      case 'voice_channels':
        return context.guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size.toString();
      case 'text_channels':
        return context.guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size.toString();
      case 'emojis':
        return context.guild.emojis.cache.size.toString();
      case 'regular_emojis':
        return context.guild.emojis.cache.filter((e) => !e.animated).size.toString();
      case 'animated_emojis':
        return context.guild.emojis.cache.filter((e) => !e.animated).size.toString();
      case 'stickers':
        return context.guild.stickers.cache.size.toString();
      case 'online_users':
        return context.guild.members.cache.filter((m) => m.presence?.status !== "offline").size.toString();
      case 'online_bots':
        return context.guild.members.cache.filter((m) => m.presence?.status !== "offline" && m.user.bot).size.toString();
      case 'online_members':
        return context.guild.members.cache.filter((m) => m.presence?.status == "online" && !m.user.bot).size.toString();
      case 'idle_members':
        return context.guild.members.cache.filter((m) => m.presence?.status == "idle" && !m.user.bot).size.toString();
      case 'dnd_members':
        return context.guild.members.cache.filter((m) => m.presence?.status == "dnd" && !m.user.bot).size.toString();
      case 'offline_members':
        return context.guild.members.cache.filter((m) => m.presence?.status == "offline" && !m.user.bot).size.toString();
        case 'categories':
          return context.guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size.toString();
        case 'announcement_channels':
          return context.guild.channels.cache.filter((c) => c.type === ChannelType.GuildAnnouncement).size.toString();
        case 'stage_channels':
          return context.guild.channels.cache.filter((c) => c.type === ChannelType.GuildStageVoice).size.toString();
        case 'forum_channels':
          return context.guild.channels.cache.filter((c) => c.type === ChannelType.GuildForum).size.toString();
        case 'media_channels':
          return context.guild.channels.cache.filter((c) => c.type === ChannelType.GuildMedia).size.toString();
    }
  }
}