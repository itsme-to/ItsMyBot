import { channelMention, roleMention, time, Role, Channel } from 'discord.js';
import { User } from '@itsmybot';

export const timeVariables = (timestamp: number, prefix = "time") => {
  return [{
    searchFor: `%${prefix}_short_date%`,
    replaceWith: time(timestamp, "d"),
  }, {
    searchFor: `%${prefix}_long_date%`,
    replaceWith: time(timestamp, "D"),
  }, {
    searchFor: `%${prefix}_short_time%`,
    replaceWith: time(timestamp, "t"),
  }, {
    searchFor: `%${prefix}_long_time%`,
    replaceWith: time(timestamp, "T"),
  }, {
    searchFor: `%${prefix}_short%`,
    replaceWith: time(timestamp, "f"),
  }, {
    searchFor: `%${prefix}_long%`,
    replaceWith: time(timestamp, "F"),
  }, {
    searchFor: `%${prefix}_relative%`,
    replaceWith: time(timestamp, "R"),
  }]
}

export const userVariables = (user: User, prefix = "user") => {
  return [{
    searchFor: `%${prefix}_id%`,
    replaceWith: user.id || "Unknown",
  }, {
    searchFor: `%${prefix}_display_name%`,
    replaceWith: user.displayName,
  }, {
    searchFor: `%${prefix}_username%`,
    replaceWith: user.username,
  }, {
    searchFor: `%${prefix}_mention%`,
    replaceWith: user.mention,
  }, {
    searchFor: `%${prefix}_pfp%`,
    replaceWith: user.avatar,
  }, {
    searchFor: `%${prefix}_bot%`,
    replaceWith: user.isBot,
  }, {
    searchFor: `%${prefix}_create_date%`,
    replaceWith: time(user.createdAt, "D"),
  }, {
    searchFor: `%${prefix}_join_date%`,
    replaceWith: time(user.joinedAt, "D"),
  }, {
    searchFor: `%${prefix}_roles%`,
    replaceWith: user.roles ? user.roles.join(", ") : "None",
  }, {
    searchFor: `%${prefix}_messages%`,
    replaceWith: user.messages,
  }, {
    searchFor: `%${prefix}_coins%`,
    replaceWith: user.coins,
  }]
}

export const channelVariables = (channel: Channel, prefix = "channel") => {
  return [{
    searchFor: `%${prefix}_id%`,
    replaceWith: channel.id,
  }, {
    searchFor: `%${prefix}_name%`,
    replaceWith: channel.isDMBased() ? "DM" : channel.name,
  }, {
    searchFor: `%${prefix}_mention%`,
    replaceWith: channelMention(channel.id),
  }, {
    searchFor: `%${prefix}_type%`,
    replaceWith: channel.type,
  },  {
    searchFor: `%${prefix}_create_date%`,
    replaceWith: channel.createdTimestamp ? time(Math.round(channel.createdTimestamp / 1000), "D") : "Unknown",
  }, {
    searchFor: `%${prefix}_topic%`,
    replaceWith: !channel.isDMBased() && !channel.isThread() && !channel.isVoiceBased() && channel.isTextBased() ? channel.topic : "None"
  }, {
    searchFor: `%${prefix}_url%`,
    replaceWith: channel.url,
  }, {
    searchFor: `%${prefix}_parent_id%`,
    replaceWith: channel.isDMBased() ? 'N/A' : channel.parent?.id || 'N/A',
  }]
}

export const roleVariables = (role: Role, prefix = "role") => {
  return [{
    searchFor: `%${prefix}_id%`,
    replaceWith: role.id,
  }, {
    searchFor: `%${prefix}_name%`,
    replaceWith: role.name,
  }, {
    searchFor: `%${prefix}_mention%`,
    replaceWith: roleMention(role.id),
  }]
}