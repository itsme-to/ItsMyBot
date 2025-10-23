import { ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandAttachmentOption, SlashCommandChannelOption, SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandUserOption, SlashCommandSubcommandGroupBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Config, User, Utils, ComponentBuilder, LangDirectory } from '@itsmybot';
import { Mixin } from 'ts-mixer';

export class CommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
  execute?: (interaction: ChatInputCommandInteraction<'cached'>, user: User) => Promise<void | any>;

  public setExecute(execute: (interaction: ChatInputCommandInteraction<'cached'>, user: User) => Promise<void | any>): this {
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

export class CommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
  subcommands: CommandSubcommandBuilder[] = [];

  execute?: (interaction: ChatInputCommandInteraction<'cached'>, user: User) => Promise<void | any>;
  
  public setExecute(execute: (interaction: ChatInputCommandInteraction<'cached'>, user: User) => Promise<void | any>): this {
    this.execute = execute
    return this;
  }

  addSubcommand(input: CommandSubcommandBuilder): this;
  addSubcommand(input: (builder: CommandSubcommandBuilder) => CommandSubcommandBuilder): this;
  public override addSubcommand(input: CommandSubcommandBuilder | ((subcommand: CommandSubcommandBuilder) => CommandSubcommandBuilder)): this {
    const builder = typeof input === "function"
      ? input(new CommandSubcommandBuilder())
      : input;

    this.subcommands.push(builder);
    super.addSubcommand(builder);
    return this;
  }
}

export class CommandBuilder extends Mixin(SlashCommandBuilder, ComponentBuilder) {
  enabled: boolean = true;
  subcommands: (CommandSubcommandBuilder | CommandSubcommandGroupBuilder)[] = [];
  config?: Config;
  lang?: LangDirectory;

  public using(config: Config, lang?: LangDirectory) {
    super.using(config);
    this.lang = lang;
    this.config = config;
    
    if (lang) this.setDescription(lang.getString(`commands.${this.name}.description`));
    if (config.has("permission")) this.setDefaultMemberPermissions(Utils.getPermissionFlags(config.getString("permission")));
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

    if (this.lang) {
      if (!builder.description) {
        builder.setDescription(this.lang.getString(`commands.${this.name}.subcommands.${builder.name}.description`));
      }

      for (const option of builder.options) {
        if (!option.description) {
          option.setDescription(this.lang.getString(`commands.${this.name}.subcommands.${builder.name}.options.${option.name}`));
        }
      }
    }
  
    this.subcommands.push(builder);
    super.addSubcommand(builder);
    return this;
  }

  addSubcommandGroup(input: CommandSubcommandGroupBuilder): this;
  addSubcommandGroup(input: (builder: CommandSubcommandGroupBuilder) => CommandSubcommandGroupBuilder): this;
  public addSubcommandGroup(
    input: CommandSubcommandGroupBuilder | ((subcommandGroup: CommandSubcommandGroupBuilder) => CommandSubcommandGroupBuilder)
  ): this {
    const builder = typeof input === "function"
      ? input(new CommandSubcommandGroupBuilder())
      : input;

    if (this.lang) {
      if (!builder.description) {
        builder.setDescription(this.lang.getString(`commands.${this.name}.subcommands.${builder.name}.description`));
      }

      for (const subcommand of builder.options) {
        if (!subcommand.description) {
          subcommand.setDescription(this.lang.getString(`commands.${this.name}.subcommands.${builder.name}.subcommands.${subcommand.name}.description`));
        }

        for (const option of subcommand.options) {
          if (!option.description) {
            option.setDescription(this.lang.getString(`commands.${this.name}.subcommands.${builder.name}.subcommands.${subcommand.name}.options.${option.name}`));
          }
        }
      }
    }


    this.subcommands.push(builder);
    super.addSubcommandGroup(builder);
    return this;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }

  public override addStringOption(input: SlashCommandStringOption | ((builder: SlashCommandStringOption) => SlashCommandStringOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandStringOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addStringOption(builder);
    return this;
  }

  public override addAttachmentOption(input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandAttachmentOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addAttachmentOption(builder);
    return this;
  }

  public override addChannelOption(input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandChannelOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addChannelOption(builder);
    return this;
  }

  public override addBooleanOption(input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandBooleanOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addBooleanOption(builder);
    return this;
  }

  public override addIntegerOption(input: SlashCommandIntegerOption | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandIntegerOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addIntegerOption(builder);
    return this;
  }

  public override addMentionableOption(input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandMentionableOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addMentionableOption(builder);
    return this;
  }

  public override addNumberOption(input: SlashCommandNumberOption | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandNumberOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addNumberOption(builder);
    return this;
  }

  public override addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): this {
    const builder = typeof input === "function"
      ? input(new SlashCommandRoleOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addRoleOption(builder);
    return this;
  }

  public override addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): this {
    let builder = typeof input === "function"
      ? input(new SlashCommandUserOption())
      : input;

    if (!builder.description && this.lang) {
      builder.setDescription(this.lang.getString(`commands.${this.name}.options.${builder.name}`));
    }

    super.addUserOption(builder);
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
    if (config.getBoolOrNull("enabled") === false) this.enabled = false;

    return this;
  }
}