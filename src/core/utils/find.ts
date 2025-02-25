import { Guild, GuildBasedChannel, TextChannel, Channel, Role } from 'discord.js';
import manager from '@itsmybot';

/**
 * Find a role by its name or id
 * 
 * @param identifier The role name or id
 * @param guild The guild to search the role in, if not provided, the primary guild will be used
 * 
 * @returns The role if found, otherwise undefined
 */
export async function findRole(identifier: string, guild?: Guild): Promise<Role | undefined> {
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

async function rawFindRole(identifier: string, guild: Guild): Promise<Role | undefined> {
  if (identifier === 'everyone' || identifier === '@everyone') return guild.roles.everyone;

  const role = guild.roles.cache.find(r => r.name.toLowerCase() === identifier || r.id === identifier);

  return role;
}

/**
 * Find a channel by its name or id
 * 
 * @param identifier The channel name or id
 * @param guild The guild to search the channel in, if not provided, the primary guild will be used
 * 
 * @returns The channel if found, otherwise undefined
 */
export async function findChannel(identifier: string, guild?: Guild): Promise<GuildBasedChannel | undefined> {
  const search = String(identifier)

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

/**
 * Find a text channel by its name or id
 *
 * @param identifier The channel name or id
 * @param guild The guild to search the channel in, if not provided, the primary guild will be used
 * 
 * @returns The text channel if found, otherwise undefined
 */
export async function findTextChannel(identifier: string, guild?: Guild): Promise<TextChannel | undefined> {
  const channel = await findChannel(identifier, guild);

  if (isGuildTextBasedChannel(channel)) return channel;

  return undefined;
}

async function rawFindChannel(identifier: string, guild: Guild): Promise<GuildBasedChannel | undefined> {
  const channel = guild.channels.cache.find(c => c.name === identifier || c.id === identifier);

  return channel;
}
