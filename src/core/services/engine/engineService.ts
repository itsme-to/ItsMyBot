import { Collection, ApplicationCommandOptionType, ChannelType } from 'discord.js';
import Utils, { Cooldown } from '@utils';

import { Script, CustomCommand, Command, User, BaseConfigSection, BaseConfig, Config, Variable, CommandInteraction, Service } from '@itsmybot';
import { Logger } from '@utils';
import MetaHandler from './meta/metaHandler.js';

import ScriptConfig from '../../resources/scripting/script.js';
import CustomCommandConfig from '../../resources/scripting/customCommand.js';
import { CommandBuilder } from '@builders';
import EngineEventEmitter from './eventEmitter.js';

/**
 * Service that manages all the scripts and custom commands.
 */
export default class EngineService extends Service {
  scripts: Collection<string, Script> = new Collection();
  customCommands: Collection<string, CustomCommand> = new Collection();
  cooldowns: Collection<string, Cooldown> = new Collection();
  event = new EngineEventEmitter();
  metaHandler: MetaHandler = new MetaHandler(this.manager);

  async initialize() {
    await this.loadScripts();
    await this.metaHandler.initialize();
    this.manager.logger.info('Script engine initialized.');
  }

  async loadScripts() {
    const scripts = await new BaseConfigSection(this.manager.logger, 'scripting/scripts', 'build/core/resources/scripting/scripts').initialize(ScriptConfig);
    for (const filePath of scripts) {
      this.registerScript(filePath[0], filePath[1], this.manager.logger);
    }
  }

  async loadCustomCommands() {
    const customCommands = await new BaseConfigSection(this.manager.logger, 'scripting/custom-commands', 'build/core/resources/scripting/custom-commands').initialize(CustomCommandConfig);

    for (const filePath of customCommands) {
      this.registerCustomCommand(filePath[0], filePath[1]);
    }
  }

  async handleCustomCommand(id: string, interaction: CommandInteraction, user: User) {
    const customCommand = this.customCommands.get(id);
    if (!customCommand) return this.manager.logger.error(`Custom command ${id} not found`);

    const context = {
      interaction,
      user,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined,
      member: interaction.member || undefined
    }

    const variables: Variable[] = []

    for (const option of interaction.options.data) {
      switch (true) {
        case option.member != null || option.member != undefined: {
          const targetUserM = await this.manager.services.user.findOrCreate(option.member)
          if (!targetUserM) break;
          variables.push(...Utils.userVariables(targetUserM, `option_${option.name}`))
          break;
        }
          
        case option.user != undefined: {
          const targetUser = await this.manager.services.user.findOrNull(option.user.id)
          if (!targetUser) break;
          variables.push(...Utils.userVariables(targetUser, `option_${option.name}`))
          break;
        }

        case option.role != null || option.role != undefined:
          variables.push(...Utils.roleVariables(option.role, `option_${option.name}`))
          break;

        case option.channel != null || option.channel != undefined:
          variables.push(...Utils.channelVariables(option.channel, `option_${option.name}`))
          break;

        case option.value != null || option.value != undefined:
          variables.push({
            searchFor: `%option_${option.name}%`,
            replaceWith: option.value,
          })
          break;

      }
    }
    customCommand.run(context, variables);
  }

  registerScript(id: string, script: BaseConfig, logger: Logger) {
    if (this.scripts.has(id)) return logger.warn(`Script ${id} is already registered`);

    const scriptClass = new Script(this.manager, script, logger);
    scriptClass.loadTriggers();

    this.scripts.set(id, scriptClass);
  }

  registerCustomCommand(id: string, customCommand: BaseConfig) {
    const customCommandClass = new CustomCommand(this.manager, customCommand, this.manager.logger);

    class CustomCommandBase extends Command {
      build() {
        const options = customCommand.getSubsectionsOrNull("options") || []
        const data = new CommandBuilder()
          .setName(customCommandClass.data.getString("name"))
          .using(customCommandClass.data)

        for (const optionConfig of options) {
          const option: CommandApplicationOption = {
            name: optionConfig.getString("name"),
            description: optionConfig.getString("description"),
            required: optionConfig.getBoolOrNull("required") || false,
            type: Utils.getCommandOptionType(optionConfig.getString("type"))!,
            max_length: undefined,
            min_length: undefined,
            max_value: undefined,
            min_value: undefined,
            channel_types: undefined,
            choices: undefined,
            toJSON() {
              return this
            }
          }

          if (option.type === ApplicationCommandOptionType.Channel) {
            if (optionConfig.has("channel-type")) {
              const channelType = Utils.getChannelType(optionConfig.getString("channel-type"))
              if (channelType) option.channel_types = [channelType]
            }
          }

          if (option.type === ApplicationCommandOptionType.String || option.type === ApplicationCommandOptionType.Number || option.type === ApplicationCommandOptionType.Integer) {
            if (optionConfig.has("choices")) {
              const choices: Config[] = optionConfig.getSubsections("choices")
              option.choices = []
              for (const choice of choices) {
                option.choices.push({ name: choice.getString("name"), value: choice.getString("value") })
              }
            }

            if (option.type === ApplicationCommandOptionType.String) {
              if (optionConfig.has("max-length")) option.max_length = optionConfig.getNumber("max-length")
              if (optionConfig.has("min-length")) option.min_length = optionConfig.getNumber("min-length")
            } else {
              if (optionConfig.has("max-value")) option.max_value = optionConfig.getNumber("max-value")
              if (optionConfig.has("min-value")) option.min_value = optionConfig.getNumber("min-value")
            }
          }

          data.options.push(option)
        }

        return data
      }

      async execute(interaction: CommandInteraction, user: User) {
        this.manager.services.engine.handleCustomCommand(id, interaction, user);
      }
    }

    this.manager.services.command.registerCommand(new CustomCommandBase(this.manager));
    this.customCommands.set(id, customCommandClass);
  }
}

interface CommandApplicationOption {
  name: string
  description: string
  required: boolean
  type: ApplicationCommandOptionType
  max_length: undefined | number
  min_length: undefined | number
  max_value: undefined | number
  min_value: undefined | number
  channel_types: undefined | ChannelType[]
  choices: undefined | { name: string, value: string | number }[]
  toJSON(): any
}

