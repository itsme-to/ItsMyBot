import { Collection, ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction } from 'discord.js';
import { Script, CustomCommand, Command, User, ConfigFolder, ConfigFile, Config, Variable, Service, Utils, Cooldown, Logger, CommandBuilder } from '@itsmybot';
import MetaHandler from './meta/metaHandler.js';

import ScriptConfig from '../../resources/scripting/script.js';
import CustomCommandConfig from '../../resources/scripting/customCommand.js';
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
    this.manager.logger.info('Script engine initialized.');
  }

  async loadScripts() {
    const scripts = await new ConfigFolder(this.manager.logger, 'scripting/scripts', 'build/core/resources/scripting/scripts').initialize(ScriptConfig);
    for (const filePath of scripts) {
      this.registerScript(filePath[0], filePath[1], this.manager.logger);
    }
  }

  async registerCustomCommands() {
    const customCommands = await new ConfigFolder(this.manager.logger, 'scripting/custom-commands', 'build/core/resources/scripting/custom-commands').initialize(CustomCommandConfig);

    for (const filePath of customCommands) {
      this.registerCustomCommand(filePath[0], filePath[1]);
    }
  }

  async handleCustomCommand(id: string, interaction: ChatInputCommandInteraction<'cached'>, user: User, config: ConfigFile) {
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

    const options = config.getSubsectionsOrNull("options") || []

    await Promise.all(options.map(async (optionConfig) => {
      const option = interaction.options.get(optionConfig.getString("name"));

      variables.push({ name: `option_${optionConfig.getString("name")}_is_provided`, value: option ? true : false });
      if (!option) return;

      variables.push({ name: `option_${option.name}`, value: option.value });

      const choice = optionConfig.getSubsectionsOrNull("choices")?.find(c => c.getString("value") === option.value?.toString());
      if (choice) {
        variables.push({ name: `option_${option.name}_choice_name`, value: choice.getString("name") });
      }

      switch (true) {
        case option.member != undefined: {
          const targetUserM = await this.manager.services.user.findOrCreate(option.member)
          if (!targetUserM) break;
          variables.push(
            ...Utils.userVariables(targetUserM, `option_${option.name}`)
          )
          break;
        }
          
        case option.user != undefined: {
          const targetUser = await this.manager.services.user.findOrNull(option.user.id)
          if (!targetUser) break;
          variables.push(
            ...Utils.userVariables(targetUser, `option_${option.name}`)
          )
          break;
        }

        case option.role != undefined:
          variables.push(
            ...Utils.roleVariables(option.role, `option_${option.name}`)
          )
          break;

        case option.channel != undefined:
          variables.push(
            ...Utils.channelVariables(option.channel, `option_${option.name}`)
          )
          break;
      }
    }));

    customCommand.run(context, variables);
  }

  registerScript(id: string, script: ConfigFile, logger: Logger) {
    if (this.scripts.has(id)) return logger.warn(`Script ${id} is already registered`);

    const scriptClass = new Script(this.manager, script, logger);
    scriptClass.loadTriggers();

    this.scripts.set(id, scriptClass);
  }

  registerCustomCommand(id: string, customCommand: ConfigFile) {
    const customCommandClass = new CustomCommand(this.manager, customCommand, this.manager.logger);

    class CustomCommandBase extends Command {
      build() {
        const options = customCommand.getSubsectionsOrNull("options") || []
        const data = new CommandBuilder()
          .setName(customCommand.getString("name"))
          .setDescription(customCommand.getString("description"))

        if (customCommand.has("permission")) {
          data.setDefaultMemberPermissions(Utils.getPermissionFlags(customCommand.getString("permission")))
        }

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

      async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
        this.manager.services.engine.handleCustomCommand(id, interaction, user, customCommand);
      }
    }

    this.manager.services.interaction.registerCommand(new CustomCommandBase(this.manager));
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

