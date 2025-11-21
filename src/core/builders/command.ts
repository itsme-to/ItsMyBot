import { ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandAttachmentOption, SlashCommandChannelOption, SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandUserOption, SlashCommandSubcommandGroupBuilder, ChatInputCommandInteraction, Collection } from 'discord.js';
import { User } from '@itsmybot';

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
  executes: Collection<string, (interaction: ChatInputCommandInteraction<'cached'>, user: User) => Promise<void | any>> = new Collection();

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

    if (builder.execute) {
      this.executes.set(`${this.name}.${builder.name}`, builder.execute);
      builder.execute = undefined;
    }

    super.addSubcommand(builder);
    return this;
  }
}

export class CommandBuilder extends SlashCommandBuilder {
  public: boolean = false;
  executes: Collection<string, (interaction: ChatInputCommandInteraction<'cached'>, user: User) => Promise<void | any>> = new Collection();

  addSubcommand(input: CommandSubcommandBuilder): this;
  addSubcommand(input: (builder: CommandSubcommandBuilder) => CommandSubcommandBuilder): this;
  public addSubcommand(
    input: ((builder: CommandSubcommandBuilder) => CommandSubcommandBuilder) | CommandSubcommandBuilder
  ): this {
    const builder = typeof input === "function"
      ? input(new CommandSubcommandBuilder())
      : input;

    if (builder.execute) {
      this.executes.set(builder.name, builder.execute);
      builder.execute = undefined;
    }

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

    if (builder.execute) {
      this.executes.set(builder.name, builder.execute);
      builder.execute = undefined;
    }

    for (const [key, subcommand] of builder.executes) {
      this.executes.set(key, subcommand);
    }

    builder.executes.clear();

    super.addSubcommandGroup(builder);
    return this;
  }

  setPublic() {
    this.public = true;
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

export class ContextMenuBuilder extends ContextMenuCommandBuilder {
  public: boolean = false;

  setPublic() {
    this.public = true;
    return this;
  }
}