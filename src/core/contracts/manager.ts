import { GatewayIntentBits, Partials } from 'discord.js'
import CommandService from 'core/services/commands/commandService'
import ComponentService from 'core/services/components/componentService'
import EngineService from 'core/services/engine/engineService'
import EventService from 'core/services/events/eventService'
import ExpansionService from 'core/services/expansions/expansionService'
import AddonService from 'core/services/addons/addonService'
import UserService from 'core/services/users/userService'
import LeaderboardService from 'core/services/leaderboards/leaderboardService'
import ConditionService from 'core/services/conditions/conditionService'
import ActionService from 'core/services/actions/actionService'
import { BaseConfig } from './config/baseConfig'

export interface ClientOptions {
  intents: GatewayIntentBits[],
  partials: Partials[]
}

export interface ManagerOptions {
  package: any,
  dir: {
    base: string,
    configs: string,
    addons: string,
    scripts: string,
    customCommands: string,
  }
}

export interface Services {

  /** Service to manage events in the bot. */
  event: EventService,

  /** Service to manage users in the bot. Users are used to store information about Discord users. */
  user: UserService,

  /** Service to manage commands in the bot. */
  command: CommandService,

  /** Service to manage conditions in the bot. Conditions are used to check if a condition is met in the scripting system in the engine. */
  condition: ConditionService,

  /** Service to manage actions in the bot. Actions are used to perform actions in the bot with the scripting system in the engine. */
  action: ActionService,

  /**  that manages all the scripts and custom commands. */
  engine: EngineService,

  /** Service to manage addons in the bot. */
  addon: AddonService,

  /** Service to manage expansions in the bot. Expansions are used to add custom placeholders to the bot. */
  expansion: ExpansionService,

  /** Service to manage components in the bot. Components are used to create buttons, select menus, and modals. */
  component: ComponentService,

  /** Service to manage leaderboards in the bot. */
  leaderboard: LeaderboardService
}

export interface ManagerConfigs {
  config: BaseConfig,
  lang: BaseConfig,
  commands: BaseConfig
}