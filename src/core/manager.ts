import { Client, Collection } from 'discord.js';
import { existsSync, mkdirSync } from 'fs';
import { ClientOptions, ManagerOptions, Services, ConfigFile, Addon, Logger, LangDirectory } from '@itsmybot'
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

interface ManagerConfigs {
  config: ConfigFile
}

export class Manager {
  public client: Client<true>;
  public services: Services = {} as Services;
  public configs: ManagerConfigs = {} as ManagerConfigs;
  public lang: LangDirectory;

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
    } catch (e) {
      this.logger.error(e)
      process.exit(1)
    }

    this.primaryGuildId = this.configs.config.getString("primary-guild");

    this.lang = new LangDirectory(this.logger, 'lang/core', 'build/core/resources/lang', 'en-US');
    await this.lang.initialize();

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
      filePath.replace('.yml', ''),
      `build/core/resources/${filePath}`
    ).initialize(ConfigClass);
  }

  private async initializeDatabase() {
    this.logger.info('Initializing database...');
    const dataConfigFile = this.configs.config.getSubsection('database');
    let database;

    if (['mysql', 'mariadb'].includes(dataConfigFile.getString('type'))) {
      database = new Sequelize(
        dataConfigFile.getString('database'),
        dataConfigFile.getString('username'),
        dataConfigFile.getString('password'),
        {
          host: dataConfigFile.getString('host'),
          dialect: dataConfigFile.getString('type') as 'mysql' | 'mariadb',
          logging: dataConfigFile.getBool('debug'),
          dialectOptions: {
            connectTimeout: dataConfigFile.getNumber('connect-timeout'),
          },
          pool: {
            acquire: 30000,
            idle: 10000,
            max: 5,
            min: 0,
          },
        }
      );
    } else {
        database = new Sequelize({
          dialect: 'sqlite',
          storage: 'database.sqlite',
          logging: dataConfigFile.getBool('debug'),
        });
    }

    try {
      await database.authenticate();
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


