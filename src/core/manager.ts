import { Client, Collection } from 'discord.js';
import { existsSync, mkdirSync } from 'fs';
import { Logger } from '@utils';
import { Command, Component, Expansion, Leaderboard, Addon, ClientOptions, ManagerOptions, Services, ManagerConfigs, BaseConfig } from '@itsmybot'
import { Sequelize } from 'sequelize-typescript';

import EventService, { EventExecutor } from './services/events/eventService.js';
import UserService from './services/users/userService.js';
import CommandService from './services/commands/commandService.js';
import EngineService from './services/engine/engineService.js';
import AddonService from './services/addons/addonService.js';
import ExpansionService from './services/expansions/expansionService.js';
import ComponentService from './services/components/componentService.js';
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
  public commands = new Collection<string, Command>();
  public events = new Collection<string, EventExecutor>();
  public addons = new Collection<string, Addon>();
  public expansions = new Collection<string, Expansion>();
  public leaderboards = new Collection<string, Leaderboard>();
  public components = {
    buttons: new Collection<string, Component>(),
    selectMenus: new Collection<string, Component>(),
    modals: new Collection<string, Component>()
  }
  public logger = new Logger();
  public primaryGuildId: string;

  constructor(clientOptions: ClientOptions, managerOptions: ManagerOptions) {
    this.client = new Client(clientOptions);
    this.managerOptions = managerOptions;

    if (!existsSync(managerOptions.dir.configs)) mkdirSync(managerOptions.dir.configs);
    if (!existsSync(managerOptions.dir.addons)) mkdirSync(managerOptions.dir.addons);
    if (!existsSync(managerOptions.dir.logs)) mkdirSync(managerOptions.dir.logs);
  }

  public async initialize(): Promise<void> {
    this.configs.config = await this.initializeConfig(DefaultConfig, 'config.yml');
    this.configs.commands = await this.initializeConfig(CommandConfig, 'commands.yml');
    this.configs.lang = await this.initializeConfig(LangConfig, 'lang.yml');

    this.primaryGuildId = this.configs.config.getString("primary-guild");

    await this.initializeDatabase();

    this.services = {
      condition: new ConditionService(this),
      action: new ActionService(this),
      engine: new EngineService(this),
      expansion: new ExpansionService(this),
      user: new UserService(this),
      event: new EventService(this),
      command: new CommandService(this),
      component: new ComponentService(this),
      leaderboard: new LeaderboardService(this),
      addon: new AddonService(this)
    }

    await this.initializeServices();

    await this.services.engine.loadCustomCommands();
    this.services.leaderboard.registerLeaderboards();
    this.services.event.initializeEvents();

    this.client.login(this.configs.config.getString("token"));

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

  private async initializeConfig(ConfigClass: unknown, filePath: string) {
    return await new BaseConfig({
      logger: this.logger,
      configFilePath: `configs/${filePath}`,
      defaultFilePath: `build/core/resources/${filePath}`,
      ConfigClass,
      id: filePath.slice(0, -4)
    }).initialize();
  }

  private async initializeDatabase() {
    this.logger.info('Initializing database...');
    const databaseConfig = this.configs.config.getSubsection('database');

    if (['mysql', 'mariadb'].includes(databaseConfig.getString('type'))) {
      this.database = new Sequelize(
        databaseConfig.getString('database'),
        databaseConfig.getString('username'),
        databaseConfig.getString('password'),
        {
          host: databaseConfig.getString('host'),
          dialect: databaseConfig.getString('type') as 'mysql' | 'mariadb',
          logging: databaseConfig.getBoolOrNull('debug') || false
        });
    } else {
        this.database = new Sequelize({
          dialect: 'sqlite',
          storage: 'database.sqlite',
          logging: databaseConfig.getBoolOrNull('debug') || false
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


