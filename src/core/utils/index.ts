import { getPermissionFlags, getButtonStyle, getActivityType, getTextInputStyle, getPresenceStatus, getCommandOptionType, getChannelType } from './converters.js';
import * as fs from 'fs/promises';
import { findRole, findChannel, findTextChannel } from './find.js';
import { setupEmbed } from './setup/setupEmbed.js';
import { setupMessage } from './setup/setupMessage.js';
import { setupComponent } from './setup/setupComponent.js';
import { setupButton } from './setup/setupButton.js';
import { setupSelectMenu } from './setup/setupSelectMenu.js';
import { setupContainer } from './setup/setupContainer.js';
import { setupModal } from './setup/setupModal.js';
import { setupThumbnail } from './setup/setupThumbnail.js';
import { setupTextDisplay } from './setup/setupTextDisplay.js';
import { userVariables, channelVariables, roleVariables, timeVariables } from './variables.js';
import { transcript, transcriptMessage } from './transcript.js';
import { formatValidationErrors } from './validation.js';

export { Logger } from './logger.js';
export { Cooldown } from './cooldown.js';
export { Pagination } from './pagination.js';

import manager, { Context, Variable, MessageOutput }from '@itsmybot';
import { GuildMember } from 'discord.js';
import { Parser } from 'expr-eval';

const discordEpoch = 1420070400000;

export default class Utils {
  /** Try to return the closest permission flag to the given string */
  static getPermissionFlags = getPermissionFlags;
  /** Try to return the closest button style to the given string */
  static getButtonStyle = getButtonStyle;
  /** Try to return the closest activity type to the given string */
  static getActivityType = getActivityType;
  /** Try to return the closest text input style to the given string */
  static getTextInputStyle = getTextInputStyle;
  /** Try to return the closest presence status to the given string */
  static getPresenceStatus = getPresenceStatus;
  /** Try to return the closest command option type to the given string */
  static getCommandOptionType = getCommandOptionType;
  /** Try to return the closest channel type to the given string */
  static getChannelType = getChannelType;

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
  static setupSelectMenu = setupSelectMenu;
  static setupContainer = setupContainer;
  static setupModal = setupModal;
  static setupThumbnail = setupThumbnail;
  static setupTextDisplay = setupTextDisplay

  static userVariables = userVariables;
  static channelVariables = channelVariables;
  static roleVariables = roleVariables;
  static timeVariables = timeVariables;

  /**
   * Transcript the given channel to a formatted string
   * @param channel The channel to transcript
   * @param limit The amount of messages to transcript, defaults to 100
   */
  static transcript = transcript;

  /**
   * Transcript a message to a formatted string
   * @param message The message to transcript
   */
  static transcriptMessage = transcriptMessage;

  static formatValidationErrors = formatValidationErrors;

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
      { searchFor: "%message_content%", replaceWith: Utils.blockPlaceholders(context.message.content) },
      { searchFor: "%message_url%", replaceWith: context.message.url })

    variables.forEach(variable => {
      if (!value) return "";
      value = value.replaceAll(variable.searchFor, variable.replaceWith?.toString() || 'undefined');
    });

    return manager.services.expansion.resolvePlaceholders(value, context);
  }

  /**
   * Blocks placeholders in a string by replacing them with underscores
   * @param value The string to block placeholders in
   * @returns The string with placeholders replaced by underscores
   */
  static blockPlaceholders<T extends string | null | undefined>(value: T): T extends string ? string : T {
    if (value === null || value === undefined) return value as any;
    return value.replace(/%(.*?)%/g, '($1)') as T extends string ? string : T;
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
  
  static isValidEmoji(emoji: string) {
    const customEmoji = /^<a?:\w+:\d+>$/;
    const discordEmoji = /:\w+:/
    const unicodeEmoji = /^((\p{Extended_Pictographic}|\p{Emoji_Component})+(\uFE0F)?(\u200D(\p{Extended_Pictographic}|\p{Emoji_Component})+)*)$/u;

    return customEmoji.test(emoji) || discordEmoji.test(emoji) || unicodeEmoji.test(emoji);
  }

  static evaluateBoolean(expression: string): boolean | null {
    const parsedExpression = Parser.parse(expression);
    const result = parsedExpression.evaluate();

    if (typeof result !== 'boolean' && result !== 0 && result !== 1) {
      return null
    }

    return result;
  }

  static evaluateNumber(expression: string) {
    const parsedExpression = Parser.parse(expression);
    const result = parsedExpression.evaluate();

    if (typeof result !== 'number') {
      return null
    }

    return result;
  }

  /**
   * Get a random element from an array
   * @param array The array to get a random element from
   */
  static getRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * Check if a member has a role and optionally check if the role is inherited
   * @param member The member to check the role for
   * @param identifiers The role name or id to check for, can be an array of roles
   * @param inherited Whether to check if the role is inherited
   */
  static hasRole(member: GuildMember, identifiers: string | string[], inherited = false) {
    const searchIdentifiers = Array.isArray(identifiers) ? identifiers : [identifiers];

    for (const identifier of searchIdentifiers) {
      const search = String(identifier).toLowerCase();

      if (search === '@everyone') return true;

      const role = this.findRole(search, member.guild);
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
      m: 60,
      s: 1
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
   * @deprecated
   * @param id The channel id to log the message to or 'none' to disable logging
   * @param message The message to log
   */
  static logToDiscord(id: string, message: MessageOutput) {
    if (id === 'none') return;

    const channel = findTextChannel(id);
    if (!channel) return;

    channel.send(message)
  }

  static capitalizeFirst(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};