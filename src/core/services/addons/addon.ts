import { Manager, ConfigFile, ConfigFolder, Logger, LangDirectory } from '@itsmybot';
import { join } from 'path';
import { Collection } from 'discord.js';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { glob } from 'fs/promises';

export abstract class Addon {
  manager: Manager
  logger: Logger
  lang: LangDirectory

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
    this.lang = new LangDirectory(this.logger, `lang/${this.name}`, `build/addons/${this.name}/resources/lang`, 'en-US');
  }

  private sanitizeName(name: string): string {
    return name.replace(/[^A-Za-z0-9 _.-]/g, "").replace(/\s+/g, "_");
  }

  async initialize() { }

  async load() { }

  async unload() { }

  async reload() {
    await this.unload()
    await this.lang.initialize();
    await this.load()
  }



  async init() {
    await this.loadDatabaseModels();
    await this.lang.initialize();
    await this.load();
    await this.initialize();
    await this.registerInteractions();
    this.logger.info(`Addon loaded in v${this.version}`);
  }

  public async registerModules() {
    const basePath = this.path;
    const directories = readdirSync(basePath).filter((name: string) => {
      const fullPath = join(basePath, name);
      return statSync(fullPath).isDirectory();
    });

    const moduleHandlers: Record<string, (dir: string) => Promise<void>> = {
      events: (dir) => this.manager.services.event.registerFromDir(dir, this),
      expansions: (dir) => this.manager.services.expansion.registerFromDir(dir, this),
      leaderboards: (dir) => this.manager.services.leaderboard.registerFromDir(dir, this),
      actions: (dir) => this.manager.services.action.registerFromDir(dir, this),
      conditions: (dir) => this.manager.services.condition.registerFromDir(dir, this),
    };
  
    await Promise.all(directories.map(async (dirName) => {
      const dir = join(basePath, dirName);

      const handler = moduleHandlers[dirName];
      if (handler) {
        await handler(dir);
      }
    }));
  }

  public unregisterModules() {
    this.manager.services.event.unregisterByAddon(this);
    this.manager.services.expansion.unregisterByAddon(this);
    this.manager.services.leaderboard.unregisterByAddon(this);
    this.manager.services.action.unregisterByAddon(this);
    this.manager.services.condition.unregisterByAddon(this);
  }

  public async registerInteractions() {
    const interactionDir = join(this.path, 'interactions');
    await this.manager.services.interaction.registerFromDir(interactionDir, this);
  }

  private async loadDatabaseModels() {
    const models = await Array.fromAsync(glob(join(this.path, 'models', '*.js').replace(/\\/g, '/')));
    
    await Promise.all(models.map(async (model) => {
      const modelUrl = new URL('file://' + model.replace(/\\/g, '/')).href;
      const { default: Model } = await import(modelUrl);

      this.manager.database.addModels([Model]);
      await Model.sync({ alter: true });
    }));
  }

  async createConfig(configFilePath: string, config?: unknown): Promise<ConfigFile> {
    const addonFolder = join(this.manager.managerOptions.dir.configs, this.name);
    if (!existsSync(addonFolder)) mkdirSync(addonFolder);

    return new ConfigFile(
      this.logger, 
      join('configs', this.name, configFilePath),
      'commands',
      join("build", "addons", this.name, "resources", configFilePath)
    ).initialize(config);
  }

  async createConfigSection(configFolderPath: string, config: unknown): Promise<Collection<string, ConfigFile>> {
    const addonFolder = join(this.manager.managerOptions.dir.configs, this.name);
    if (!existsSync(addonFolder)) mkdirSync(addonFolder);

    return new ConfigFolder(
      this.logger,
      join('configs', this.name, configFolderPath),
      join("build", "addons", this.name, "resources", configFolderPath)
    ).initialize(config);
  }
}