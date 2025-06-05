import Utils from '@utils';
import { CommandBuilder } from '@builders';
import { Command, User, Meta, CommandInteraction } from '@itsmybot';
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
            option.setName("mode")
              .setDescription(command.getString("options.mode"))
              .setRequired(true)
              .addChoices(
                { name: "Global", value: "global" },
                { name: "User", value: "user" },
                { name: "Channel", value: "channel" }
              ))
          .addStringOption(option =>
            option.setName("type")
              .setDescription(command.getString("options.type"))
              .setRequired(true)
              .addChoices(
                { name: "String", value: "string" },
                { name: "Number", value: "number" },
                { name: "Boolean", value: "boolean" }
              ))
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
            option.setName("mode")
              .setDescription(command.getString("options.mode"))
              .setRequired(true)
              .addChoices(
                { name: "Global", value: "global" },
                { name: "User", value: "user" },
                { name: "Channel", value: "channel" }
              ))
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
            option.setName("mode")
              .setDescription(command.getString("options.mode"))
              .setRequired(true)
              .addChoices(
                { name: "Global", value: "global" },
                { name: "User", value: "user" },
                { name: "Channel", value: "channel" }
              ))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("switch")
          .setDescription(command.getString("subcommands.switch.description"))
          .addStringOption(option =>
            option.setName("key")
              .setDescription(command.getString("options.key"))
              .setRequired(true))
          .addBooleanOption(option =>
            option.setName("value")
              .setDescription(command.getString("options.value"))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("mode")
              .setDescription(command.getString("options.mode"))
              .setRequired(true)
              .addChoices(
                { name: "Global", value: "global" },
                { name: "User", value: "user" },
                { name: "Channel", value: "channel" }
              ))
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
            option.setName("mode")
              .setDescription(command.getString("options.mode"))
              .setRequired(true)
              .addChoices(
                { name: "Global", value: "global" },
                { name: "User", value: "user" },
                { name: "Channel", value: "channel" }
              ))
          .addStringOption(option =>
            option.setName("type")
              .setDescription(command.getString("options.type"))
              .setRequired(true)
              .addChoices(
                { name: "String", value: "string" },
                { name: "Number", value: "number" },
                { name: "Boolean", value: "boolean" }
              ))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(command.getString("options.scope"))
              .setRequired(false)));
  }

  async execute(interaction: CommandInteraction, user: User) {
    const subcommand = interaction.options.getSubcommand();
    const key = interaction.options.getString("key", true);
    const mode = interaction.options.getString("mode", true) as "global" | "user" | "channel";
    const scope = interaction.options.getString("scope") ?? undefined;
    const context = {
      guild: interaction.guild,
      channel: interaction.channel || undefined,
      user,
      member: interaction.member,
    }

    const scopeId = mode === "global" ? "global" : scope;

    if ((mode === 'user' || mode === 'channel') && !scopeId) {
      return interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection("meta.scope-required"),
        variables: [
          { searchFor: "%meta_mode%", replaceWith: mode }
        ],
        context
      }));
    }

    switch (subcommand) {
      case "set": {
        const value = interaction.options.getString("value", true);
        const type = interaction.options.getString("type", true);
        await this.manager.services.engine.metaHandler.createOrUpdate(key, mode, type, value, scopeId);
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.set"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value },
            { searchFor: "%meta_mode%", replaceWith: mode },
            { searchFor: "%meta_type%", replaceWith: type }
          ],
          context
        }));
      }

      case "add":
      case "subtract": {
        const value = interaction.options.getInteger("value", true);
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, mode, "number", "0", scopeId);
        await meta[subcommand](value); // dynamic call to .add() or .subtract()
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection(`meta.${subcommand}`),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value.toString() },
            { searchFor: "%meta_mode%", replaceWith: mode }
          ],
          context
        }));
      }

      case "switch": {
        const value = interaction.options.getBoolean("value", true);
        await this.manager.services.engine.metaHandler.createOrUpdate(key, mode, "boolean", value.toString(), scopeId);
        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.switch"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_value%", replaceWith: value ? "true" : "false" },
            { searchFor: "%meta_mode%", replaceWith: mode }
          ],
          context
        }));
      }

      case "remove": {
        const type = interaction.options.getString("type", true);
        const meta = await Meta.findOne({ where: { key, mode, type, scopeId } });
        await meta?.destroy();

        return interaction.reply(await Utils.setupMessage({
          config: this.manager.configs.lang.getSubsection("meta.remove"),
          variables: [
            { searchFor: "%meta_key%", replaceWith: key },
            { searchFor: "%meta_mode%", replaceWith: mode },
            { searchFor: "%meta_type%", replaceWith: type }
          ],
          context
        }));
      }
    }
  }
}

