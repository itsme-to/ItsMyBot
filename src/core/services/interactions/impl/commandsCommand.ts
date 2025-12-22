import { Command, User, CommandBuilder, ContextMenu, Addon, Utils } from '@itsmybot';
import { AutocompleteInteraction, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { CommandModel } from '../command.model.js';
export default class CommandsCommand extends Command {

  build() {
    return new CommandBuilder()
      .setName('commands')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setPublic()
      .addSubcommand(subcommand =>
        subcommand
          .setName('enable')
          .setExecute(this.enable.bind(this))
          .addStringOption(option =>
            option
              .setName('command')
              .setRequired(true)
              .setAutocomplete(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('disable')
          .setExecute(this.disable.bind(this))
          .addStringOption(option =>
            option
              .setName('command')
              .setRequired(true)
              .setAutocomplete(true)))
      .addSubcommandGroup(subcommandGroup =>
        subcommandGroup
          .setName('permission')
          .addSubcommand(subcommand =>
            subcommand
              .setName('set')
              .setExecute(this.setPermission.bind(this))
              .addStringOption(option =>
                option
                  .setName('command')
                  .setRequired(true)
                  .setAutocomplete(true))
              .addStringOption(option =>
                option
                  .setName('permission')
                  .setRequired(true)
                  .setAutocomplete(true)))
          .addSubcommand(subcommand =>
            subcommand
              .setName('remove')
              .setExecute(this.removePermission.bind(this))
              .addStringOption(option =>
                option
                  .setName('command')
                  .setRequired(true)
                  .setAutocomplete(true))));
  }

  async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    const focusedValue = interaction.options.getFocused(true);
    switch (focusedValue.name) {
      case 'command':
        return this.autocompleteCommand(interaction);
      case 'permission':
        return this.autocompletePermission(interaction);
    }
  }

  async autocompleteCommand(interaction: AutocompleteInteraction<'cached'>) {
    const focusedValue = interaction.options.getFocused(true);
    const subcommand = interaction.options.getSubcommand(true);
    const commandStatus: boolean = subcommand === 'enable';

    const choices: (Command<Addon | undefined> | ContextMenu<Addon | undefined>)[] = Array.from(this.manager.services.interaction.registries.commands.values())
      .filter(cmd => cmd.data.name.startsWith(focusedValue.value))
      .filter(cmd => cmd.data.name !== 'commands')
      .filter(cmd => cmd.enabled !== commandStatus);
      
    await interaction.respond(
      choices.map(choice => ({ name: choice.data.name, value: choice.data.name })).slice(0, 25)
    );
  }

  async autocompletePermission(interaction: AutocompleteInteraction<'cached'>) {
    const focusedValue = interaction.options.getFocused(true);
    const choices = Object.entries(PermissionFlagsBits).map(([perm, value]) => ({ name: perm, value: value.toString() }));
    await interaction.respond(choices.filter(choice => choice.name.startsWith(focusedValue.value)).slice(0, 25));
  }

  async enable(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const commandOption = Utils.blockPlaceholders(interaction.options.getString('command', true));
    const command = this.manager.services.interaction.registries.commands.get(commandOption);
    const commandDB = await CommandModel.findOne({ where: { id: commandOption } });

    const variables = [
      { name: 'command', value: commandOption }
    ];

    const context = {
      user: user,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined
    };

    if (!command || !commandDB) {
      interaction.reply(await this.manager.lang.buildMessage({
        key: 'command.not-found',
        ephemeral: true,
        context,
        variables
      }));
      return;
    }

    command.enabled = true;
    commandDB.enabled = true;
    await commandDB.save({ fields: ['enabled'] });

    interaction.reply(await this.manager.lang.buildMessage({
      key: 'command.enabled',
      ephemeral: true,
      context,
      variables
    }));

    await this.manager.services.interaction.addDiscordCommand(command);
  }

  async disable(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const commandOption = Utils.blockPlaceholders(interaction.options.getString('command', true));
    const command = this.manager.services.interaction.registries.commands.get(commandOption);
    const commandDB = await CommandModel.findOne({ where: { id: commandOption } });

    const variables = [
      { name: 'command', value: commandOption }
    ];

    const context = {
      user: user,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined
    };

    if (!command || !commandDB) {
      interaction.reply(await this.manager.lang.buildMessage({
        key: 'command.not-found',
        ephemeral: true,
        context,
        variables
      }));
      return;
    }

    command.enabled = false;
    commandDB.enabled = false;
    await commandDB.save({ fields: ['enabled'] });

    interaction.reply(await this.manager.lang.buildMessage({
      key: 'command.disabled',
      ephemeral: true,
      context,
      variables
    }));

    await this.manager.services.interaction.removeDiscordCommand(command);
  }

  async setPermission(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const commandOption = Utils.blockPlaceholders(interaction.options.getString('command', true));
    const permissionOption = Utils.blockPlaceholders(interaction.options.getString('permission', true));
    const command = this.manager.services.interaction.registries.commands.get(commandOption);
    const commandDB = await CommandModel.findOne({ where: { id: commandOption } });

    const variables = [
      { name: 'command', value: commandOption }
    ];

    const context = {
      user: user,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined
    };

    if (!Object.values(PermissionFlagsBits).map(v => v.toString()).includes(permissionOption)) {
      interaction.reply(await this.manager.lang.buildMessage({
        key: 'command.permission.unknown',
        ephemeral: true,
        context,
        variables
      }));
      return;
    }

    if (!commandDB || !command) {
      interaction.reply(await this.manager.lang.buildMessage({
        key: 'command.not-found',
        ephemeral: true,
        context,
        variables
      }));
      return;
    }

    commandDB.permission = permissionOption;
    command.data.setDefaultMemberPermissions(BigInt(permissionOption));
    await commandDB.save({ fields: ['permission'] });

    interaction.reply(await this.manager.lang.buildMessage({
      key: 'command.permission.set',
      ephemeral: true,
      context,
      variables: [
        ...variables,
        { name: 'permission', value: permissionOption }
      ]
    }));

    if (commandDB.enabled) {
      await this.manager.services.interaction.updateDiscordCommand(command);
    }
  }
  
  async removePermission(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const commandOption = Utils.blockPlaceholders(interaction.options.getString('command', true));
    const command = this.manager.services.interaction.registries.commands.get(commandOption);
    const commandDB = await CommandModel.findOne({ where: { id: commandOption } });

    const variables = [
      { name: 'command', value: commandOption }
    ];

    const context = {
      user: user,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined
    };

    if (!commandDB || !command) {
      interaction.reply(await this.manager.lang.buildMessage({
        key: 'command.not-found',
        ephemeral: true,
        context,
        variables
      }));
      return;
    }

    commandDB.permission = null;
    command.data.setDefaultMemberPermissions(null);
    await commandDB.save({ fields: ['permission'] });

    interaction.reply(await this.manager.lang.buildMessage({
      key: 'command.permission.remove',
      ephemeral: true,
      context,
      variables
    }));

    if (commandDB.enabled) {
      await this.manager.services.interaction.updateDiscordCommand(command);
    }
  }
}

