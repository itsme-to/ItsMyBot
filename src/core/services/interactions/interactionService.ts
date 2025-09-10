import { join, dirname } from 'path';
import { sync } from 'glob';
import { fileURLToPath } from 'url';

import { AutocompleteInteraction, Collection, RepliableInteraction } from 'discord.js';
import { Manager, Command, ContextMenu, Addon, Service, Button, SelectMenu, Modal, ResolvableInteraction } from '@itsmybot';

/**
 * Service to manage interactions in the bot.
 */
export default class InteractionService extends Service {
  registries: {
    buttons: Collection<string, Button<Addon | undefined>>,
    selectMenus: Collection<string, SelectMenu<Addon | undefined>>,
    modals: Collection<string, Modal<Addon | undefined>>,
    commands: Collection<string, Command<Addon | undefined>>,
    contextMenus: Collection<string, ContextMenu<Addon | undefined>>,
  }

  constructor(manager: Manager) {
    super(manager)

    this.registries = {
      buttons: new Collection(),
      selectMenus: new Collection(),
      modals: new Collection(),
      commands: new Collection(),
      contextMenus: new Collection(),
    };
  }

  async initialize() {
    await this.registerFromDir(join(dirname(fileURLToPath(import.meta.url)), 'impl'))
    this.manager.logger.info("Interaction service initialized.");
  }

  getCommand(name: string) {
    return this.registries.commands.get(name) || null;
  }

  getContextMenu(name: string) {
    return this.registries.contextMenus.get(name) || null;
  }
  
  getButton(customId: string) {
    return this.registries.buttons.get(customId) || null;
  }

  getSelectMenu(customId: string) {
    return this.registries.selectMenus.get(customId) || null;
  }

  getModal(customId: string) {
    return this.registries.modals.get(customId) || null;
  }

  async registerFromDir(interactionDir: string, addon: Addon | null = null) {
    const interactionFiles = sync(join(interactionDir, '**', '*.js').replace(/\\/g, '/'));

    for (const filePath of interactionFiles) {
      const commandPath = new URL('file://' + filePath.replace(/\\/g, '/')).href;
      const { default: CommandInstance } = await import(commandPath);
      const instance = new CommandInstance(this.manager, addon);

      switch (true) {
        case instance instanceof Command:
          this.registerCommand(instance);
          break;
        case instance instanceof ContextMenu:
          this.registerContextMenu(instance);
          break;
        case instance instanceof Button:
          this.registerButton(instance);
          break;
        case instance instanceof SelectMenu:
          this.registerSelectMenu(instance);
          break;
        case instance instanceof Modal:
          this.registerModal(instance);
          break;
        default:
          this.manager.logger.warn(`Unknown interaction type for instance from file: ${filePath}`);
      }
    };
  }

  registerCommand(command: Command<Addon | undefined>) {
    try {
      if (!command.data) throw new Error("Command needs a data object.");
      if (this.registries.commands.has(command.data.name)) throw new Error("Command already exists.");

      this.registries.commands.set(command.data.name, command);

      if (command.data.aliases) {
        for (const alias of command.data.aliases) {
          const aliasCommandInstance = command;
          aliasCommandInstance.data.setName(alias).setAliases([]);
          if (this.registries.commands.has(alias)) throw new Error(`Command alias '${alias}' already exists.`);
          this.registries.commands.set(alias, aliasCommandInstance);
        }
      }
    } catch (error: any) {
      command.logger.error(`Error initializing command '${command.data.name}'`, error);
    }
  }

  registerContextMenu(contextMenu: ContextMenu<Addon | undefined>) {
    try {
      if (!contextMenu.data) throw new Error("Context menu needs a data object.");
      if (this.registries.contextMenus.has(contextMenu.data.name)) throw new Error("Context menu already exists.");

      this.registries.contextMenus.set(contextMenu.data.name, contextMenu);
    } catch (error: any) {
      contextMenu.logger.error(`Error initializing context menu '${contextMenu.data.name}'`, error);
    }
  }

  registerButton(button: Button<Addon | undefined>) {
    try {
      if (!button.customId) throw new Error("Button needs a customId.");
      if (this.registries.buttons.has(button.customId)) throw new Error("Button already exists.");

      this.registries.buttons.set(button.customId, button);
    } catch (error: any) {
      button.logger.error(`Error initializing button '${button.customId}'`, error);
    }
  }

  registerSelectMenu(selectMenu: SelectMenu<Addon | undefined>) {
    try {
      if (!selectMenu.customId) throw new Error("SelectMenu needs a customId.");
      if (this.registries.selectMenus.has(selectMenu.customId)) throw new Error("SelectMenu already exists.");

      this.registries.selectMenus.set(selectMenu.customId, selectMenu);
    } catch (error: any) {
      selectMenu.logger.error(`Error initializing selectMenu '${selectMenu.customId}'`, error);
    }
  }
  
  resolveInteraction(interaction: RepliableInteraction | AutocompleteInteraction): ResolvableInteraction | undefined {
    if (interaction.isButton()) {
      return this.getButton(interaction.customId) || undefined;
    }
    if (interaction.isAnySelectMenu()) {
      return this.getSelectMenu(interaction.customId) || undefined;
    }
    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      return this.getCommand(interaction.commandName) || undefined;
    }
    if (interaction.isContextMenuCommand()) {
      return this.getContextMenu(interaction.commandName) || undefined;
    }
    if (interaction.isModalSubmit()) {
      return this.getModal(interaction.customId) || undefined;
    }
    return undefined;
  }

  registerModal(modal: Modal<Addon | undefined>) {
    try {
      if (!modal.customId) throw new Error("Modal needs a customId.");
      if (this.registries.modals.has(modal.customId)) throw new Error("Modal already exists.");

      this.registries.modals.set(modal.customId, modal);
    } catch (error: any) {
      modal.logger.error(`Error initializing modal '${modal.customId}'`, error);
    }
  }

  async deployCommands() {
    const enabledCommands = [...this.registries.commands.values(), ...this.registries.contextMenus.values()]
      .filter(cmd => !(cmd.data.enabled === false))
      .map(cmd => cmd.data);
    
    try {
      const primaryGuildCommands = enabledCommands.filter(cmd => cmd.public === false);
      const guild = await this.manager.client.guilds.fetch(this.manager.primaryGuildId);
      if (primaryGuildCommands && guild) await guild.commands.set(primaryGuildCommands);

      const publicCommands = enabledCommands.filter(cmd => cmd.public === true);
      if (publicCommands) await this.manager.client.application?.commands.set(publicCommands);
    } catch (error: any) {
      this.manager.logger.error(`Error syncing commands to Discord: ${error.message}`, error);
    }
  }
}

