import { Manager } from '@itsmybot';
import { Logger } from '@utils';
import { join } from 'path';
import { sync } from 'glob';
import { BaseConfig, BaseConfigSection } from '@contracts';
import { Collection } from 'discord.js';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';

export abstract class Plugin {
  manager: Manager
  logger: Logger

  name: string
  abstract version: string
  abstract authors: string[]
  description?: string
  website?: string
  enabled: boolean = true
  configs?: unknown
  path: string

  constructor(manager: Manager, name: string) {
    this.manager = manager;
    this.name = this.sanitizeName(name);
    this.logger = new Logger(this.name);
    this.path = join(manager.managerOptions.dir.plugins, name);
  }


  private sanitizeName(name: string): string {
    return name.replace(/[^A-Za-z0-9 _.-]/g, "").replace(/\s+/g, "_");
  }

  async initialize() { }

  async load() { }

  async unload() { }

  async reload() {
    await this.unload()
    await this.load()
  }

  async init() {
    await this.loadDatabaseModels();
    await this.load()
    await this.initialize();
    await this.loadComponents();
    this.logger.info(`Plugin loaded in v${this.version}`);
  }

  public async loadComponents(includes: string[] = []) {
    const basePath = this.path;
    const directories = readdirSync(basePath).filter((name: string) => {
      const fullPath = join(basePath, name);
      return statSync(fullPath).isDirectory();
    });

    const componentHandlers: Record<string, (dir: string) => Promise<void>> = {
      commands: (dir) => this.manager.services.command.registerFromDir(dir, this),
      events: (dir) => this.manager.services.event.registerFromDir(dir, this),
      expansions: (dir) => this.manager.services.expansion.registerFromDir(dir, this),
      leaderboards: (dir) => this.manager.services.leaderboard.registerFromDir(dir, this),
      actions: (dir) => this.manager.services.action.registerFromDir(dir, this),
      conditions: (dir) => this.manager.services.condition.registerFromDir(dir, this),
      buttons: (dir) => this.manager.services.component.registerFromDir(dir, 'button', this),
      selectMenus: (dir) => this.manager.services.component.registerFromDir(dir, 'selectMenu', this),
      modals: (dir) => this.manager.services.component.registerFromDir(dir, 'modal', this),
    };
  
    for (const dirName of directories) {
      const dir = join(basePath, dirName);
      if (!sync(`${dir}/*`).length) continue;

      if (includes.length && !includes.includes(dirName)) continue;

      const handler = componentHandlers[dirName];
      if (handler) {
        await handler(dir);
      }
    }
  }

  private async loadDatabaseModels() {
    const models = sync(join(this.path, 'models', '*.js').replace(/\\/g, '/'));

    for (const model of models) {
      const modelUrl = new URL('file://' + model.replace(/\\/g, '/')).href;
      const { default: Model } = await import(modelUrl);

      this.manager.database.addModels([Model]);
      await Model.sync({ alter: true });
    }
  }

  async createConfig(configFilePath: string, config?: unknown, update: boolean = false): Promise<BaseConfig> {
    const pluginFolder = join(this.manager.managerOptions.dir.configs, this.name);
    if (!existsSync(pluginFolder)) mkdirSync(pluginFolder);

    return new BaseConfig({
      ConfigClass: config,
      logger: this.logger,
      configFilePath: join('configs', this.name, configFilePath),
      defaultFilePath: join("build", "plugins", this.name, "resources", configFilePath),
      update: update,
      id: configFilePath.slice(0, -4)
    }).initialize();
  }

  async createConfigSection(configFolderPath: string, config: unknown): Promise<Collection<string, BaseConfig>> {
    const pluginFolder = join(this.manager.managerOptions.dir.configs, this.name);
    if (!existsSync(pluginFolder)) mkdirSync(pluginFolder);

    return new BaseConfigSection(
      config,
      this.logger,
      join('configs', this.name, configFolderPath),
      join("build", "plugins", this.name, "resources", configFolderPath)
    ).initialize();
  }
}