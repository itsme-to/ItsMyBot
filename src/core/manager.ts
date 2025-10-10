import { Client, Collection } from 'discord.js';
import { existsSync, mkdirSync } from 'fs';
import { ClientOptions, ManagerOptions, Services, ManagerConfigs, ConfigFile, Addon, Logger } from '@itsmybot'
import { Sequelize } from 'sequelize-typescript';

import EventService from './services/events/eventService.js';
import UserService from './services/users/userService.js';
import InteractionService from './services/interactions/interactionService.js';
import EngineService from './services/engine/engineService.js';
import AddonService from './services/addons/addonService.js';
import ExpansionService from './services/expansions/expansionService.js';
import LeaderboardService from './services/leaderboards/leaderboardService.js';
import ConditionService from './services/conditions/conditionService.js';
import ActionService from './services/actions/actionService.js';
import DefaultConfig from 'core/resources/config.js';
import CommandConfig from 'core/resources/commands.js';
import LangConfig from 'core/resources/lang.js';

export class Manager {
  public client: Client<true>;
  public services: Services = {} as Services;
  public configs: ManagerConfigs = {} as ManagerConfigs;
  public database: Sequelize;

  public managerOptions: ManagerOptions;

  public addons = new Collection<string, Addon>();

  public logger = new Logger();
  public primaryGuildId: string;

  constructor(clientOptions: ClientOptions, managerOptions: ManagerOptions) {
    this.client = new Client(clientOptions);
    this.managerOptions = managerOptions;

    if (!existsSync(managerOptions.dir.configs)) mkdirSync(managerOptions.dir.configs);
    if (!existsSync(managerOptions.dir.addons)) mkdirSync(managerOptions.dir.addons);
  }

  public async initialize(): Promise<void> {
    try {
      this.configs.config = await this.createConfig(DefaultConfig, 'config.yml');
      this.configs.commands = await this.createConfig(CommandConfig, 'commands.yml');
      this.configs.lang = await this.createConfig(LangConfig, 'lang.yml');
    } catch (e) {
      this.logger.error(e)
      process.exit(1)
    }

    this.primaryGuildId = this.configs.config.getString("primary-guild");

    await this.initializeDatabase();

    this.services = {
      addon: new AddonService(this),
      condition: new ConditionService(this),
      action: new ActionService(this),
      engine: new EngineService(this),
      expansion: new ExpansionService(this),
      user: new UserService(this),
      event: new EventService(this),
      interaction: new InteractionService(this),
      leaderboard: new LeaderboardService(this)
    }

    await this.services.engine.metaHandler.initialize();
    await this.initializeServices();

    await this.services.engine.registerCustomCommands();
    this.services.leaderboard.registerLeaderboards();
    this.services.event.initializeEvents();
    await this.services.addon.initializeAddons();

    await this.client.login(this.configs.config.getString("token"));

    this.client.on('reconnecting', () => {
      this.logger.debug('The client is trying to reconnect.');
    });

    this.client.on('disconnect', () => {
      this.logger.debug('The client has disconnected.');
    });

    this.client.on('resumed', () => {
      this.logger.debug('The client has successfully reconnected.');
    });
  }

  private async createConfig(ConfigClass: unknown, filePath: string) {
    return await new ConfigFile(
      this.logger,
      `configs/${filePath}`,
      `build/core/resources/${filePath}`
    ).initialize(ConfigClass);
  }

  private async initializeDatabase() {
    this.logger.info('Initializing database...');
    const dataConfigFile = this.configs.config.getSubsection('database');

    if (['mysql', 'mariadb'].includes(dataConfigFile.getString('type'))) {
      this.database = new Sequelize(
        dataConfigFile.getString('database'),
        dataConfigFile.getString('username'),
        dataConfigFile.getString('password'),
        {
          host: dataConfigFile.getString('host'),
          dialect: dataConfigFile.getString('type') as 'mysql' | 'mariadb',
          logging: dataConfigFile.getBoolOrNull('debug') || false
        });
    } else {
        this.database = new Sequelize({
          dialect: 'sqlite',
          storage: 'database.sqlite',
          logging: dataConfigFile.getBoolOrNull('debug') || false
        });
    }

    try {
      await this.database.authenticate();
      this.logger.info('Connection has been established successfully with database.');
    } catch (error) {
      this.logger.error('Unable to connect to the database:', error);
      process.exit(1);
    }
  }

  private async initializeServices() {
    for (const service of Object.values(this.services)) {
      await service.initialize();
    }
  }
}


