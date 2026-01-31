
import { join } from 'path';
import { Manager, Addon, Service, Logger } from '@itsmybot';
import { Collection } from 'discord.js';
import AddonModel from './addon.model.js';
import { access, glob } from 'fs/promises';

/**
 * Service to manage addons in the bot.
 */
export default class AddonService extends Service {
  addonsDir: string;
  addons: Collection<string, Addon>;

  constructor(manager: Manager) {
    super(manager);
    this.addonsDir = manager.managerOptions.dir.addons;
    this.addons = manager.addons;

    this.manager.database.addModels([AddonModel]);
  }

  async initialize() {
    this.manager.logger.info("Initializing addons...");

    await AddonModel.sync({ alter: true });

    const addonFolders = await Array.fromAsync(glob("*/", { cwd: this.addonsDir }));
    
    for (const addon of addonFolders) {
      if (addon.startsWith("_")) continue;

      const logger = new Logger(addon);
      try {
        await this.registerAddon(addon.replace(/\/$/, ''));
      } catch (error: any) {
        logger.error("Error registering addon:", error);
      }
    }

    this.manager.logger.info("Addon service initialized.");
  }

  async registerAddon(name: string) {
    const addonClassPath = join(this.addonsDir, name, 'index.js');
    try {
      await access(addonClassPath);
    } catch {
      throw new Error(`Addon ${name} is missing the index.js file.`);
    }

    const addonClass = new URL('file://' + addonClassPath.replace(/\\/g, '/')).href;
    const { default: Addon } = await import(addonClass);
    const addon = new Addon(this.manager, name) as Addon;

    if (this.addons.has(addon.name)) {
      throw new Error(`Addon ${addon.name} already exists.`);
    }  

    const [addonData] = await AddonModel.findOrCreate({ where: { name: addon.name } });
    if (!addonData.enabled) {
      addon.enabled = false;
    } else {
      await addon.registerModules();
    }

    this.addons.set(addon.name, addon);
  }

  async initializeAddons() {
    await Promise.all(this.addons.map(async addon => {
      try {
        await addon.init();
      } catch (error) {
        addon.logger.error("Error initializing addon:", error);
        addon.enabled = false;
        addon.unregisterModules();
        this.addons.delete(addon.name);
      }
    }));
  }
}