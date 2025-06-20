import { Events as DiscordEvents } from 'discord.js';

enum BotEvents {
  EveryHour = 'everyHour',
  EveryMinute = 'everyMinute',
  BotReady = 'botReady',
  ButtonClick = 'buttonClick',
  SelectMenu = 'selectMenu',
  ModalSubmit = 'modalSubmit',
  VoiceJoin = 'voiceJoin',
  VoiceLeave = 'voiceLeave',

  /** 
   * @deprecated Use `Events.ButtonClick` instead. 
   */
  Button = ButtonClick,
}

const Events = {
  ...BotEvents,
  ...DiscordEvents
}

type EventType = keyof typeof Events;

export { Events, EventType }

