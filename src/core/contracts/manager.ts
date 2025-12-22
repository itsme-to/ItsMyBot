import { GatewayIntentBits, Partials } from 'discord.js'
import InteractionService from '../services/interactions/interactionService.js'
import EngineService from '../services/engine/engineService.js'
import EventService from '../services/events/eventService.js'
import ExpansionService from '../services/expansions/expansionService.js'
import AddonService from '../services/addons/addonService.js'
import UserService from '../services/users/userService.js'
import LeaderboardService from '../services/leaderboards/leaderboardService.js'
import ConditionService from 'core/services/conditions/conditionService.js'
import ActionService from 'core/services/actions/actionService.js'

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

  /** Service to manage interactions in the bot. */
  interaction: InteractionService,

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

  /** Service to manage leaderboards in the bot. */
  leaderboard: LeaderboardService
}