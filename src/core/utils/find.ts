import { Guild, GuildBasedChannel, TextChannel, Channel, Role } from 'discord.js';
import { manager } from '@itsmybot';

export function findRole(identifier: string, guild?: Guild): Role | undefined {
  const search = String(identifier).toLowerCase();

  if (search.includes(';')) {
    const [guildId, name] = search.split(';', 2);
    const identifierGuild = manager.client.guilds.cache.get(guildId);

    if (identifierGuild) return rawFindRole(name, identifierGuild);
  }

  if (guild) return rawFindRole(search, guild);

  const primaryGuild = manager.client.guilds.cache.get(manager.primaryGuildId);
  if (primaryGuild) return rawFindRole(search, primaryGuild);

  return undefined
}

function rawFindRole(identifier: string, guild: Guild): Role | undefined {
  if (identifier === 'everyone' || identifier === '@everyone') return guild.roles.everyone;

  const role = guild.roles.cache.find(r => r.name.toLowerCase() === identifier || r.id === identifier);

  return role;
}

export function findChannel(identifier: string, guild?: Guild): GuildBasedChannel | undefined {
  const search = String(identifier)
  if (search === 'none') return undefined;

  if (search.includes(';')) {
    const [guildId, name] = search.split(';', 2);
    const identifierGuild = manager.client.guilds.cache.get(guildId);

    if (identifierGuild) return rawFindChannel(name, identifierGuild);
  }

  if (guild) return rawFindChannel(search, guild);

  const primaryGuild = manager.client.guilds.cache.get(manager.primaryGuildId);
  if (primaryGuild) return rawFindChannel(search, primaryGuild);

  return undefined
}

function isGuildTextBasedChannel(channel?: Channel): channel is TextChannel {
  return channel && channel.isTextBased() && !channel.isDMBased() || false
}

export function findTextChannel(identifier: string, guild?: Guild): TextChannel | undefined {
  const channel = findChannel(identifier, guild);

  if (isGuildTextBasedChannel(channel)) return channel;

  return undefined;
}

function rawFindChannel(identifier: string, guild: Guild): GuildBasedChannel | undefined {
  const channel = guild.channels.cache.find(c => c.name === identifier || c.id === identifier);

  return channel;
}
