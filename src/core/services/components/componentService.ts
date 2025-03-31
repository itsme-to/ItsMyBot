import { join } from 'path';
import { sync } from 'glob';
import { Component, Manager, Addon, Service } from '@itsmybot';
import { Collection } from 'discord.js';

/**
 * Service to manage components in the bot.
 * Components are used to create buttons, select menus, and modals.
 */
export default class ComponentService extends Service {
  buttons: Collection<string, Component<Addon | undefined>>;
  selectMenus: Collection<string, Component<Addon | undefined>>;
  modals: Collection<string, Component<Addon | undefined>>;

  constructor(manager: Manager) {
    super(manager);
    this.buttons = manager.components.buttons;
    this.selectMenus = manager.components.selectMenus;
    this.modals = manager.components.modals;
  }

  async initialize() {
    this.manager.logger.info("Component service initialized.");
  }

  getButton(name: string) {
    return this.buttons.get(name) || null;
  }

  getSelectMenu(name: string) {
    return this.selectMenus.get(name) || null;
  }

  getModal(name: string) {
    return this.modals.get(name) || null;
  }

  getButtons() {
    return this.buttons;
  }

  getSelectMenus() {
    return this.selectMenus;
  }

  getModals() {
    return this.modals;
  }

  async registerFromDir(componentDir: string, type: string, addon: Addon | undefined = undefined) {
    const componentFiles = sync(join(componentDir, '**', '*.js').replace(/\\/g, '/'));

    for (const filePath of componentFiles) {
      const componentPath = new URL('file://' + filePath.replace(/\\/g, '/')).href;
      const { default: Component } = await import(componentPath);

      switch (type) {
        case 'button':
          await this.registerButton(new Component(this.manager, addon));
          break;
        case 'selectMenu':
          await this.registerSelectMenu(new Component(this.manager, addon));
          break;
        case 'modal':
          await this.registerModal(new Component(this.manager, addon));
          break;
      }
    };
  }

  async registerButton(button: Component<Addon | undefined>) {
    try {
      if (this.buttons.has(button.customId)) throw new Error("Button already exists.");

      this.buttons.set(button.customId, button);
    } catch (error: any) {
      button.logger.error(`Error initializing button '${button.customId}'`, error);
    }
  }

  async registerSelectMenu(selectMenu: Component<Addon | undefined>) {
    try {
      if (this.selectMenus.has(selectMenu.customId)) throw new Error("SelectMenu already exists.");

      this.selectMenus.set(selectMenu.customId, selectMenu);
    } catch (error: any) {
      selectMenu.logger.error(`Error initializing selectMenu '${selectMenu.customId}'`, error);
    }
  }

  async registerModal(modal: Component<Addon | undefined>) {
    try {
      if (this.modals.has(modal.customId)) throw new Error("Modal already exists.");

      this.modals.set(modal.customId, modal);
    } catch (error: any) {
      modal.logger.error(`Error initializing modal '${modal.customId}'`, error);
    }
  }
}