import { join, dirname } from 'path';
import { sync } from 'glob';
import { fileURLToPath } from 'url';

import { AutocompleteInteraction, Collection, RepliableInteraction } from 'discord.js';
import { Manager, Command, ContextMenu, Addon, Service, Button, SelectMenu, Modal, ResolvableInteraction, CommandBuilder, ContextMenuBuilder } from '@itsmybot';
import { CommandModel } from './command.model.js';

/**
 * Service to manage interactions in the bot.
 */
export default class InteractionService extends Service {
  registries: {
    buttons: Collection<string, Button<Addon | undefined>>,
    selectMenus: Collection<string, SelectMenu<Addon | undefined>>,
    modals: Collection<string, Modal<Addon | undefined>>,
    commands: Collection<string, Command<Addon | undefined> | ContextMenu<Addon | undefined>>
  }

  constructor(manager: Manager) {
    super(manager)  
    this.manager.database.addModels([CommandModel]);

    this.registries = {
      buttons: new Collection(),
      selectMenus: new Collection(),
      modals: new Collection(),
      commands: new Collection()
    };
  }

  async initialize() {
    await this.registerFromDir(join(dirname(fileURLToPath(import.meta.url)), 'impl'))
    this.manager.logger.info("Interaction service initialized.");
    await CommandModel.sync();
  }

  getCommand(name: string) {
    return this.registries.commands.get(name) || null;
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
          this.registerCommand(instance);
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

  registerCommand(command: Command<Addon | undefined> | ContextMenu<Addon | undefined>) {
    try {
      if (!command.data) throw new Error("Command needs a data object.");
      if (this.registries.commands.has(command.data.name)) throw new Error("Command already exists.");
      this.registries.commands.set(command.data.name, command);
    } catch (error: any) {
      command.logger.error(`Error initializing command '${command.data.name}'`, error);
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

  unregisterByAddon(addon: Addon) {
    for (const [customId, button] of this.registries.buttons) {
      if (button.addon === addon) {
        this.registries.buttons.delete(customId);
      }
    }
    for (const [customId, selectMenu] of this.registries.selectMenus) {
      if (selectMenu.addon === addon) {
        this.registries.selectMenus.delete(customId);
      }
    }
    for (const [customId, modal] of this.registries.modals) {
      if (modal.addon === addon) {
        this.registries.modals.delete(customId);
      }
    }
    for (const [name, command] of this.registries.commands) {
      if (command.addon === addon) {
        this.registries.commands.delete(name);
      }
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
      return this.getCommand(interaction.commandName) || undefined;
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
    const commands = await CommandModel.findAll();
    let update = false;
    const commandsToUpdate: (CommandBuilder | ContextMenuBuilder)[] = [];
    
    for (const command of this.registries.commands.values()) {
      const existingCommand = commands.find(cmd => cmd.id === command.data.name);
      if (existingCommand) {
        if (existingCommand.permission) {
          command.data.setDefaultMemberPermissions(existingCommand.permission);
        }

        if (existingCommand.data !== command.data.toJSON()) {
          existingCommand.data = command.data.toJSON();
          await existingCommand.save({ fields: ['data'] });
          update = true;
        }

        if (existingCommand.enabled) {
          commandsToUpdate.push(command.data);
        } else {
          command.enabled = false;
        }
      } else {
        update = true;
        commandsToUpdate.push(command.data);
        await CommandModel.create({
          id: command.data.name,
          data: command.data.toJSON(),
          permission: command.data.default_member_permissions,
          enabled: true
        });
      }
    }

    if (!update) return;
    
    try {
      if (commandsToUpdate) await this.manager.client.application.commands.set(commandsToUpdate, this.manager.primaryGuildId);
    } catch (error: any) {
      this.manager.logger.error(`Error syncing commands to Discord: ${error.message}`, error);
    }
  }

  public async updateDiscordCommand(command: Command<Addon | undefined> | ContextMenu<Addon | undefined>) {
    try {
      const guild = await this.manager.client.guilds.fetch(this.manager.primaryGuildId);
      if (guild) {
        const discordCommand = await guild.commands.fetch().then(cmds => cmds.find(cmd => cmd.name === command.data.name));
        if (!discordCommand) return;
        await guild.commands.edit(discordCommand.id, command.data);
      }
    } catch (error: any) {
      this.manager.logger.error(`Error updating command '${command.data.name}': ${error.message}`, error);
    }
  }

  public async addDiscordCommand(command: Command<Addon | undefined> | ContextMenu<Addon | undefined>) {    
    try {
      const guild = await this.manager.client.guilds.fetch(this.manager.primaryGuildId);
      if (guild) {
        await guild.commands.create(command.data);
      }
    } catch (error: any) {
      this.manager.logger.error(`Error adding command '${command.data.name}': ${error.message}`, error);
    }
  }

  public async removeDiscordCommand(command: Command<Addon | undefined> | ContextMenu<Addon | undefined>) {
    try {
      const guild = await this.manager.client.guilds.fetch(this.manager.primaryGuildId);
      if (guild) {
        const discordCommand = await guild.commands.fetch().then(cmds => cmds.find(cmd => cmd.name === command.data.name));
        if (!discordCommand) return;

        await guild.commands.delete(discordCommand.id);
      }
    } catch (error: any) {
      this.manager.logger.error(`Error removing command '${command.data.name}': ${error.message}`, error);
    }
  }
}

