import { channelMention, roleMention, time, Role, Channel } from 'discord.js';
import { User } from '@itsmybot';

export const timeVariables = (timestamp: number, prefix = "time") => {
  return [{
    name: `${prefix}_short_date`,
    value: time(timestamp, "d"),
  }, {
    name: `${prefix}_long_date`,
    value: time(timestamp, "D"),
  }, {
    name: `${prefix}_short_time`,
    value: time(timestamp, "t"),
  }, {
    name: `${prefix}_long_time`,
    value: time(timestamp, "T"),
  }, {
    name: `${prefix}_short`,
    value: time(timestamp, "f"),
  }, {
    name: `${prefix}_long`,
    value: time(timestamp, "F"),
  }, {
    name: `${prefix}_relative`,
    value: time(timestamp, "R"),
  }]
}

export const userVariables = (user: User, prefix = "user") => {
  return [{
    name: `${prefix}_id`,
    value: user.id || "Unknown",
  }, {
    name: `${prefix}_display_name`,
    value: user.displayName,
  }, {
    name: `${prefix}_username`,
    value: user.username,
  }, {
    name: `${prefix}_mention`,
    value: user.mention,
  }, {
    name: `${prefix}_avatar`,
    value: user.avatar,
  }, {
    name: `${prefix}_bot`,
    value: user.isBot,
  }, {
    name: `${prefix}_create_date`,
    value: time(user.createdAt, "D"),
  }, {
    name: `${prefix}_join_date`,
    value: user.joinedAt ? time(user.joinedAt, "D") : "Unknown",
  }, {
    name: `${prefix}_roles`,
    value: user.roles ? user.roles.join(", ") : "None",
  }, {
    name: `${prefix}_messages`,
    value: user.messages,
  }, {
    name: `${prefix}_coins`,
    value: user.coins,
  }]
}

export const channelVariables = (channel: Channel, prefix = "channel") => {
  return [{
    name: `${prefix}_id`,
    value: channel.id,
  }, {
    name: `${prefix}_name`,
    value: channel.isDMBased() ? "DM" : channel.name,
  }, {
    name: `${prefix}_mention`,
    value: channelMention(channel.id),
  }, {
    name: `${prefix}_type`,
    value: channel.type,
  },  {
    name: `${prefix}_create_date`,
    value: channel.createdTimestamp ? time(Math.round(channel.createdTimestamp / 1000), "D") : "Unknown",
  }, {
    name: `${prefix}_topic`,
    value: !channel.isDMBased() && !channel.isThread() && !channel.isVoiceBased() && channel.isTextBased() ? channel.topic : "None"
  }, {
    name: `${prefix}_url`,
    value: channel.url,
  }, {
    name: `${prefix}_parent_id`,
    value: channel.isDMBased() ? 'N/A' : channel.parent?.id || 'N/A',
  }]
}

export const roleVariables = (role: Role, prefix = "role") => {
  return [{
    name: `${prefix}_id`,
    value: role.id,
  }, {
    name: `${prefix}_name`,
    value: role.name,
  }, {
    name: `${prefix}_mention`,
    value: roleMention(role.id),
  }]
}