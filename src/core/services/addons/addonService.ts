
import { join } from 'path';
import { sync } from 'glob';
import { promises as fs } from 'fs';

import { Manager, Addon } from '@itsmybot';
import { Collection } from 'discord.js';
import { Logger } from '@utils';
import AddonModel from './addon.model.js';
import { Service } from '@contracts';

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

    const addonFolders = sync("*/", { cwd: this.addonsDir, dot: false });
    for (const addonFolder of addonFolders) {
      if (addonFolder.startsWith("_")) continue;

      const logger = new Logger(addonFolder);
      try {
        await this.loadAddon(addonFolder);
      } catch (error: any) {
        logger.error("Error loading:", error);
      }
    }

    this.manager.logger.info("Addon service initialized.");
  }

  async loadAddon(name: string) {
    const addonClassPath = join(this.addonsDir, name, 'index.js');
    try {
      await fs.access(addonClassPath);
    } catch {
      throw new Error(`Addon ${name} is missing the index.js file.`);
    }

    const addonClass = new URL('file://' + addonClassPath.replace(/\\/g, '/')).href;
    const { default: Addon } = await import(addonClass);
    const addon = new Addon(this.manager, name);

    if (this.addons.has(addon.name)) {
      throw new Error(`Addon ${addon.name} already exists.`);
    }

    const [addonData] = await AddonModel.findOrCreate({ where: { name: addon.name } });
    if (!addonData.enabled) {
      addon.setEnabled(false);
    } else {
      await addon.init();
    }

    this.addons.set(addon.name, addon);
  }
}