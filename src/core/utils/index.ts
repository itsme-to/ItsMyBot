import { permissionFlags, buttonStyle, activityType, textInputStyle, presenceStatus, commandOptionType, channelType } from './enumerations.js';
import * as fs from 'fs/promises';
import { findRole, findChannel, findTextChannel } from './find.js';
import { setupEmbed } from './setup/setupEmbed.js';
import { setupMessage } from './setup/setupMessage.js';
import { setupComponent } from './setup/setupComponent.js';
import { setupButton } from './setup/setupButton.js';
import { setupModal } from './setup/setupModal.js';
import { userVariables, channelVariables, roleVariables, timeVariables } from './variables.js';

export { Logger } from './logger/index.js';
export { Cooldown } from './cooldown.js';
export { Pagination } from './pagination.js';

import manager from '@itsmybot';

import { GuildMember } from 'discord.js';
import { Context, Variable, MessageOutput } from '@contracts';

const discordEpoch = 1420070400000;

export default class Utils {
  static permissionFlags = permissionFlags;
  static buttonStyle = buttonStyle;
  static activityType = activityType;
  static textInputStyle = textInputStyle;
  static presenceStatus = presenceStatus;
  static commandOptionType = commandOptionType;
  static channelType = channelType;

  /**
   * Find a role by its name or id
   * @param identifier The role name or id
   * @param guild The guild to search the role in, if not provided, the primary guild will be used
   */
  static findRole = findRole;

  /**
   * Find a channel by its name or id
   * @param identifier The channel name or id
   * @param guild The guild to search the channel in, if not provided, the primary guild will be used
   */
  static findChannel = findChannel;

  /**
   * Find a text channel by its name or id
   * @param identifier The channel name or id
   * @param guild The guild to search the channel in, if not provided, the primary guild will be used
   */
  static findTextChannel = findTextChannel;

  static setupEmbed = setupEmbed;
  static setupMessage = setupMessage;
  static setupComponent = setupComponent;
  static setupButton = setupButton;
  static setupModal = setupModal;

  static userVariables = userVariables;
  static channelVariables = channelVariables;
  static roleVariables = roleVariables;
  static timeVariables = timeVariables;

  static async fileExists(filePath: string) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Apply variables and placeholder to a string
   * @param value The string to apply variables to
   * @param variables The variables to apply
   * @param context The context to apply variables and placeholders from 
   */
  static async applyVariables(value: string | undefined, variables: Variable[], context?: Context) {
    if (!value) return ""

    if (context?.user) variables.push(...this.userVariables(context.user));
    if (context?.channel) variables.push(...this.channelVariables(context.channel));
    if (context?.role) variables.push(...this.roleVariables(context.role));
    if (context?.content) variables.push({ searchFor: "%content%", replaceWith: context.content })
    if (context?.message) variables.push(
      { searchFor: "%message_content%", replaceWith: context.message.content },
      { searchFor: "%message_url%", replaceWith: context.message.url })

    variables.forEach((variable) => {
      if (!value) return "";
      value = value.replaceAll(variable.searchFor, variable.replaceWith?.toString() || 'undefined');
    });

    return manager.services.expansion.resolvePlaceholders(value, context);
  }

  /**
   * Wait for a specific amount of time
   * @param ms The amount of time to wait in milliseconds
   */
  static async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static isValidURL(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a random element from an array
   * @param array The array to get a random element from
   */
  static getRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  static removeHiddenLines(text: string) {
    let texts = text.split('\n');

    texts = texts.filter((line) => !line.startsWith('show=false '));
    texts = texts.map((line) => line.replace('show=true ', ''));

    return texts.join('\n');
  }

  /**
   * Check if a member has a role and optionally check if the role is inherited
   * @param member The member to check the role for
   * @param identifiers The role name or id to check for, can be an array of roles
   * @param inherited Whether to check if the role is inherited
   */
  static async hasRole(member: GuildMember, identifiers: string | string[], inherited = false) {
    const searchIdentifiers = Array.isArray(identifiers) ? identifiers : [identifiers];

    for (const identifier of searchIdentifiers) {
      const search = String(identifier).toLowerCase();

      if (search === '@everyone') return true;

      const role = await this.findRole(search, member.guild);
      if (!role) continue;
      if (member.roles.cache.has(role.id)) return true;

      if (inherited && member.roles.highest.comparePositionTo(role) > 0) return true;
    }

    return false;
  }

  static generateSnowflake() {
    let timestamp = Date.now();
    timestamp -= discordEpoch;

    return (BigInt(timestamp) << 22n).toString();
  }

  static getDateFromSnowflake(snowflake: string | number | bigint) {
    const binary = BigInt(snowflake).toString(2);
    const timestamp = parseInt(binary.substring(0, binary.length - 22), 2) + discordEpoch;
    return new Date(timestamp);
  }

  /**
   * Format a time in seconds to a human readable format
   * @param seconds The time in seconds to format
   * @example
   * formatTime(3600) // 1h
   * formatTime(90061) // 1d 1h 1m 1s
   */
  static formatTime(seconds: number) {
    const timeUnits: { [key: string]: number } = {
      month: 30 * 24 * 60 * 60,
      day: 24 * 60 * 60,
      hour: 60 * 60,
      minute: 60
    };

    let remainingSeconds = seconds;
    const result = [];

    for (const unit in timeUnits) {
      if (remainingSeconds >= timeUnits[unit]) {
        const value = Math.floor(remainingSeconds / timeUnits[unit]);
        remainingSeconds -= value * timeUnits[unit];
        result.push({ value, unit });
      }
    }

    if (remainingSeconds > 0) {
      result.push({ value: remainingSeconds, unit: 'second' });
    }

    return result.slice(0, 3).map(({ value, unit }) => {
      if (result.length === 1) {
        return value === 1 ? `${value} ${unit}` : `${value} ${unit}s`;
      }
      return `${value}${unit.charAt(0)}`;
    }).join(' ');
  }

  /**
   * Parse a time string to milliseconds
   * @param time The time string to parse
   * @example
   * parseTime('1d 2h 3m') // 93780000
   * parseTime('1d2h3m') // 93780000
   */
  static parseTime(time: string): number {
    const timeUnits: { [key: string]: number } = {
      d: 24 * 60 * 60,
      h: 60 * 60,
      m: 60
    };

    const matches = time.match(/(\d+)([a-z]+)/g);
    if (!matches) return 0;

    let result = 0;
    for (const match of matches) {
      const value = parseInt(match);
      const unit = match.replace(value.toString(), '');
      result += value * timeUnits[unit];
    }

    return result * 1000;
  }

  /**
   * Log a message to a discord channel
   * @param id The channel id to log the message to or 'none' to disable logging
   * @param message The message to log
   */
  static async logToDiscord(id: string, message: MessageOutput) {
    if (id === 'none') return;

    const channel = await findTextChannel(id);
    if (!channel) return;

    channel.send(message)
  }

  static capitalizeFirst(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};