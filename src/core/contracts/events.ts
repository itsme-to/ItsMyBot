import { Events as DiscordEvents } from 'discord.js';

enum BotEvents {
  EveryHour = 'everyHour',
  EveryMinute = 'everyMinute',
  ButtonClick = 'buttonClick',
  SelectMenu = 'selectMenu',
  ModalSubmit = 'modalSubmit',
  VoiceJoin = 'voiceJoin',
  VoiceLeave = 'voiceLeave',

  /** 
   * @deprecated Use `Events.ButtonClick` instead. 
   */
  Button = ButtonClick,

  /** 
   * @deprecated Use `Events.BotReady` instead. 
   */
  BotReady = 'clientReady',
}

const Events = {
  ...BotEvents,
  ...DiscordEvents
}

type EventType = keyof typeof Events;

export { Events, EventType }

