import Utils from '@utils';
import { CommandBuilder } from '@builders';
import { Command, User, MetaData, CommandInteraction } from '@itsmybot';
export default class MetaCommand extends Command {

  build() {
    const command = this.manager.configs.commands.getSubsection("meta");

    return new CommandBuilder()
      .setName('meta')
      .using(command)
      .addSubcommand(subcommand =>
        subcommand.setName("set")
          .setDescription(command.getString("subcommands.set.description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("value")
              .setDescription(command.getString("options.value"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("add")
          .setDescription(command.getString("subcommands.add.description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addIntegerOption(option =>
            option.setName("value")
              .setDescription(command.getString("options.value"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("subtract")
          .setDescription(command.getString("subcommands.subtract.description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addIntegerOption(option =>
            option.setName("value")
              .setDescription(command.getString("options.value"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("toggle")
          .setDescription(command.getString("subcommands.toggle.description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addBooleanOption(option =>
            option.setName("value")
              .setDescription(command.getString("options.value"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("list-add")
          .setDescription(command.getString("subcommands.list-add.description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("value")
              .setDescription(command.getString("options.value"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false))) 
      .addSubcommand(subcommand =>
        subcommand.setName("list-remove")
          .setDescription(command.getString("subcommands.list-remove.description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("value")
              .setDescription(command.getString("options.value"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false))) 
      .addSubcommand(subcommand =>
        subcommand.setName("remove")
          .setDescription(command.getString("description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false)));
  }

  async execute(interaction: CommandInteraction, user: User) {
    const subcommand = interaction.options.getSubcommand();
    const key = Utils.blockPlaceholders(interaction.options.getString("key", true));
    const scope = Utils.blockPlaceholders(interaction.options.getString("scope")) ?? undefined;
    const context = {
      guild: interaction.guild,
      channel: interaction.channel || undefined,
      user,
      member: interaction.member,
    }
    const meta = this.manager.services.engine.metaHandler.metas.get(key);
    if (!meta) {
      return interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection("meta.not-found"),
        variables: [
          { searchFor: "%meta_key%", replaceWith: key }
        ],
        context
      }));
    }

    const scopeId = meta.mode === "global" ? "global" : scope;

    if ((meta.mode === 'user' || meta.mode === 'channel') && !scopeId) {
      return interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection("meta.scope-required"),
        variables: [
          { searchFor: "%meta_mode%", replaceWith: meta.mode }
        ],
        context
      }));
    }

    switch (subcommand) {
      case "set": {
        const value = Utils.blockPlaceholders(interaction.options.getString("value", true));
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, value, scopeId);
        await meta.setValue(value);
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.set"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value },
            { searchFor: "%meta_mode%", replaceWith: meta.mode },
            { searchFor: "%meta_type%", replaceWith: meta.type }
          ],
          context
        }));
      }

      case "add":
      case "subtract": {
        const value = interaction.options.getInteger("value", true);
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, '0', scopeId);
        await meta[subcommand](value); // dynamic call to .add() or .subtract()
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection(`meta.${subcommand}`),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value.toString() },
            { searchFor: "%meta_mode%", replaceWith: meta.mode }
          ],
          context
        }));
      }

      case "toggle": {
        const value = interaction.options.getBoolean("value", true);
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, value.toString(), scopeId);
        await meta.toggle(value);
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.toggle"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value ? "true" : "false" },
            { searchFor: "%meta_mode%", replaceWith: meta.mode }
          ],
          context
        }));
      }

      case "list-add": {
        const value = Utils.blockPlaceholders(interaction.options.getString("value", true));
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, "[]", scopeId);
        await meta.listAdd(value);
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.list-add"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value },
            { searchFor: "%meta_mode%", replaceWith: meta.mode }
          ],
          context
        }));
      }

      case "list-remove": {
        const value = Utils.blockPlaceholders(interaction.options.getString("value", true));
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, "[]", scopeId);
        await meta.listRemove(value);
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.list-remove"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value },
            { searchFor: "%meta_mode%", replaceWith: meta.mode }
          ],
          context
        }));
      }

      case "remove": {
        const meta = await MetaData.findOne({ where: { key, scopeId } });
        await meta?.destroy();

        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.remove"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
          ],
          context
        }));
      }
    }
  }
}

