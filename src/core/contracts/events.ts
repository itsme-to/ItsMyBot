import { Events as DiscordEvents } from 'discord.js';

enum BotEvents {
  EveryHour = 'everyHour',
  EveryMinute = 'everyMinute',
  EveryDay = 'everyDay',
  ButtonClick = 'buttonClick',
  /** @deprecated Use Events.SelectMenuSubmit instead */
  SelectMenu = 'selectMenu',
  SelectMenuSubmit = 'selectMenuSubmit',
  ModalSubmit = 'modalSubmit',
  VoiceJoin = 'voiceJoin',
  VoiceLeave = 'voiceLeave',
  BotReady = 'botReady'
}

const Events = {
  ...BotEvents,
  ...DiscordEvents
}

type EventType = keyof typeof Events;

export { Events, EventType }

