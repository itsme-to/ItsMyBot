import { Logger, Utils } from '@itsmybot';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import { glob } from 'glob';
import { Collection } from 'discord.js';
import { ConfigFile } from './configFile.js';

/**
 * Class representing a folder of configuration files.
 */
export class ConfigFolder {
  public logger: Logger;
  /** Collection of configuration files */
  public configs: Collection<string, ConfigFile> = new Collection();
  /** Relative path to the config folder */
  private folderPath: string;
  /** Absolute path to the config folder */
  private absoluteFolderPath: string;
  /** Absolute path to the default config folder */
  private defaultFolderPath: string;

  constructor(logger: Logger, folderPath: string, defaultFolderPath: string) {
    this.logger = logger;
    this.folderPath = folderPath;
    this.absoluteFolderPath = join(resolve(), folderPath);
    this.defaultFolderPath = join(resolve(), defaultFolderPath);
  }

  /**
   * Initialize the config folder.
   * @param configClass The config class to use for initialization.
   * @return The collection of configuration files.
   */
  public async initialize(configClass: unknown) {
    // Check if default folder exists
    if (!await Utils.fileExists(this.defaultFolderPath)) {
      throw [`Default folder not found at ${this.defaultFolderPath}`];
    }

    // Create config folder if it doesn't exist and copy default files
    if (!await Utils.fileExists(this.absoluteFolderPath)) {
      this.logger.warn(`Config folder not found at ${this.folderPath}, creating one`);
      await fs.mkdir(this.absoluteFolderPath, { recursive: true });
      await fs.cp(this.defaultFolderPath, this.absoluteFolderPath, { recursive: true, force: true, filter: (src) => src.endsWith('.yml') });
    }

    await this.loadFiles(configClass);
    return this.configs;
  }

  /** 
   * Load all config files in the folder 
   */
  private async loadFiles(configClass?: unknown) {
    // Find all .yml files in the config folder, ignoring those starting with '_'
    const files = await glob('**/!(_)*.yml', { cwd: this.absoluteFolderPath, dot: true });

    // Load each config file
    await Promise.all(files.map(async (file) => {
      const destPath = join(this.folderPath, file);
      const id = file.slice(0, -4);
      const config = await new ConfigFile(this.logger, destPath, id).initialize(configClass);
      this.configs.set(config.id, config);
    }));
  }
}