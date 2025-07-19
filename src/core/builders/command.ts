import { ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandAttachmentOption, SlashCommandChannelOption, SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandUserOption } from 'discord.js';
import { ComponentBuilder } from '@builders';
import Utils from '@utils';
import { Config, User, CommandInteraction } from '@itsmybot';
import { Mixin } from 'ts-mixer';

export class CommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
  execute?: (interaction: CommandInteraction, user: User) => Promise<void | any>;
  
  public setExecute(execute: (interaction: CommandInteraction, user: User) => Promise<void | any>): this {
    this.execute = execute
    return this;
  }

  public override addStringOption(input: SlashCommandStringOption | ((builder: SlashCommandStringOption) => SlashCommandStringOption)): this {
    super.addStringOption(input);
    return this;
  }

  public override addAttachmentOption(input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): this {
    super.addAttachmentOption(input);
    return this;
  }

  public override addChannelOption(input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): this {
    super.addChannelOption(input);
    return this;
  }

  public override addBooleanOption(input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): this {
    super.addBooleanOption(input);
    return this;
  }

  public override addIntegerOption(input: SlashCommandIntegerOption | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)): this {
    super.addIntegerOption(input);
    return this;
  }

  public override addMentionableOption(input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): this {
    super.addMentionableOption(input);
    return this;
  }

  public override addNumberOption(input: SlashCommandNumberOption | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)): this {
    super.addNumberOption(input);
    return this;
  }

  public override addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): this {
    super.addRoleOption(input);
    return this;
  }

  public override addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): this {
    super.addUserOption(input);
    return this;
  }
}

export class CommandBuilder extends Mixin(SlashCommandBuilder, ComponentBuilder) {
  aliases: string[] = [];
  enabled: boolean = true;
  subcommands: CommandSubcommandBuilder[] = [];

  public using(config: Config) {
    super.using(config);
    
    if (config.has("description")) this.setDescription(config.getString("description"));
    if (config.has("permission")) this.setDefaultMemberPermissions(Utils.getPermissionFlags(config.getString("permission")));
    if (config.has("aliases")) this.setAliases(config.getStrings("aliases"));
    if (config.getBoolOrNull("enabled") === false) this.setEnabled(false);

    return this;
  }

  addSubcommand(input: CommandSubcommandBuilder): this;
  addSubcommand(input: (builder: CommandSubcommandBuilder) => CommandSubcommandBuilder): this;
  public addSubcommand(
    input: ((builder: CommandSubcommandBuilder) => CommandSubcommandBuilder) | CommandSubcommandBuilder
  ): this {
    const builder = typeof input === "function"
      ? input(new CommandSubcommandBuilder())
      : input;
  
    this.subcommands.push(builder);
    super.addSubcommand(builder);
    return this;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }

  public setAliases(aliases: string[]) {
    this.aliases = aliases;
    return this;
  }
}

export class ContextMenuBuilder extends Mixin(ContextMenuCommandBuilder, ComponentBuilder) {
  enabled: boolean = true;

  public using(config: Config) {
    super.using(config);

    if (config.has("permission")) {
      this.setDefaultMemberPermissions(Utils.getPermissionFlags(config.getString("permission")));
    }
    if (config.getBoolOrNull("enabled") === false) this.setEnabled(false);

    return this;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }
}
