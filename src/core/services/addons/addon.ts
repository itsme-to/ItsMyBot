import { Manager, BaseConfig, BaseConfigSection } from '@itsmybot';
import { Logger } from '@utils';
import { join } from 'path';
import { sync } from 'glob';
import { Collection } from 'discord.js';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';

export abstract class Addon {
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
    this.path = join(manager.managerOptions.dir.addons, name);
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
    await this.load();
    await this.initialize();
    await this.registerInteractions();
    this.logger.info(`Addon loaded in v${this.version}`);
  }

  public async registerComponents() {
    const basePath = this.path;
    const directories = readdirSync(basePath).filter((name: string) => {
      const fullPath = join(basePath, name);
      return statSync(fullPath).isDirectory();
    });

    const componentHandlers: Record<string, (dir: string) => Promise<void>> = {
      events: (dir) => this.manager.services.event.registerFromDir(dir, this),
      expansions: (dir) => this.manager.services.expansion.registerFromDir(dir, this),
      leaderboards: (dir) => this.manager.services.leaderboard.registerFromDir(dir, this),
      actions: (dir) => this.manager.services.action.registerFromDir(dir, this),
      conditions: (dir) => this.manager.services.condition.registerFromDir(dir, this),
    };
  
    for (const dirName of directories) {
      const dir = join(basePath, dirName);
      if (!sync(`${dir}/*`).length) continue;

      const handler = componentHandlers[dirName];
      if (handler) {
        await handler(dir);
      }
    }
  }

  public async registerInteractions() {
    const interactionDir = join(this.path, 'interactions');
    if (!sync(`${interactionDir}/*`).length) return;
    await this.manager.services.interaction.registerFromDir(interactionDir, this);
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
    const addonFolder = join(this.manager.managerOptions.dir.configs, this.name);
    if (!existsSync(addonFolder)) mkdirSync(addonFolder);

    return new BaseConfig({
      logger: this.logger,
      configFilePath: join('configs', this.name, configFilePath),
      defaultFilePath: join("build", "addons", this.name, "resources", configFilePath),
      update: update,
      id: configFilePath.slice(0, -4)
    }).initialize(config);
  }

  async createConfigSection(configFolderPath: string, config: unknown): Promise<Collection<string, BaseConfig>> {
    const addonFolder = join(this.manager.managerOptions.dir.configs, this.name);
    if (!existsSync(addonFolder)) mkdirSync(addonFolder);

    return new BaseConfigSection(
      this.logger,
      join('configs', this.name, configFolderPath),
      join("build", "addons", this.name, "resources", configFolderPath)
    ).initialize(config);
  }
}