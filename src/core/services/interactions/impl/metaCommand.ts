import { Command, User, Utils, MetaData, CommandBuilder } from '@itsmybot';
import { AutocompleteInteraction, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
export default class MetaCommand extends Command {

  build() {
    return new CommandBuilder()
      .setName('meta')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addSubcommand(subcommand =>
        subcommand.setName("set")
          .addStringOption(option =>
            option.setName("key")
              .setDescription(this.manager.lang.getString('commands.meta.options.key'))
              .setAutocomplete(true)
              .setRequired(true))
          .addStringOption(option =>
            option.setName("value")
              .setDescription(this.manager.lang.getString('commands.meta.options.value'))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(this.manager.lang.getString('commands.meta.options.scope'))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("add")
          .addStringOption(option =>
            option.setName("key")
              .setDescription(this.manager.lang.getString('commands.meta.options.key'))
              .setAutocomplete(true)
              .setRequired(true))
          .addIntegerOption(option =>
            option.setName("value")
              .setDescription(this.manager.lang.getString('commands.meta.options.value'))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(this.manager.lang.getString('commands.meta.options.scope'))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("subtract")
          .addStringOption(option =>
            option.setName("key")
              .setDescription(this.manager.lang.getString('commands.meta.options.key'))
              .setAutocomplete(true)
              .setRequired(true))
          .addIntegerOption(option =>
            option.setName("value")
              .setDescription(this.manager.lang.getString('commands.meta.options.value'))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(this.manager.lang.getString('commands.meta.options.scope'))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("toggle")
          .addStringOption(option =>
            option.setName("key")
              .setDescription(this.manager.lang.getString('commands.meta.options.key'))
              .setAutocomplete(true)
              .setRequired(true))
          .addBooleanOption(option =>
            option.setName("value")
              .setDescription(this.manager.lang.getString('commands.meta.options.value'))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(this.manager.lang.getString('commands.meta.options.scope'))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("list-add")
          .addStringOption(option =>
            option.setName("key")
              .setDescription(this.manager.lang.getString('commands.meta.options.key'))
              .setAutocomplete(true)
              .setRequired(true))
          .addStringOption(option =>
            option.setName("value")
              .setDescription(this.manager.lang.getString('commands.meta.options.value'))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(this.manager.lang.getString('commands.meta.options.scope'))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("list-remove")
          .addStringOption(option =>
            option.setName("key")
              .setDescription(this.manager.lang.getString('commands.meta.options.key'))
              .setAutocomplete(true)
              .setRequired(true))
          .addStringOption(option =>
            option.setName("value")
              .setDescription(this.manager.lang.getString('commands.meta.options.value'))
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(this.manager.lang.getString('commands.meta.options.scope'))
              .setRequired(false)))
      .addSubcommand(subcommand =>
        subcommand.setName("remove")
          .addStringOption(option =>
            option.setName("key")
              .setDescription(this.manager.lang.getString('commands.meta.options.key'))
              .setAutocomplete(true)
              .setRequired(true))
          .addStringOption(option =>
            option.setName("scope")
              .setDescription(this.manager.lang.getString('commands.meta.options.scope'))
              .setRequired(false)));
  }

  async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    const focusedValue = interaction.options.getFocused(true);
    if (focusedValue.name !== 'key') return;

    const type = {
      string: ['set', 'remove'],
      number: ['add', 'subtract', 'set', 'remove'],
      boolean: ['toggle', 'set', 'remove'],
      list: ['list-add', 'list-remove', 'set', 'remove']
    }

    const metas = this.manager.services.engine.metaHandler.metas;
    if (!metas) return;
    
    const filteredMetas = Array.from(metas.keys()).filter(key => {
      const meta = metas.get(key);
      if (!meta) return false;
      return type[meta.type].includes(interaction.options.getSubcommand());
    });

    await interaction.respond(filteredMetas.map(key => ({ name: key, value: key })));
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
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

      return interaction.reply(await this.manager.lang.buildMessage({
        key: 'messages.meta.not-found',
        ephemeral: true,
        variables: [
          { name: "meta_key", value: key }
        ],
        context
      }));
    }

    const scopeId = meta.mode === "global" ? "global" : scope || 'global';

    if ((meta.mode === 'user' || meta.mode === 'channel') && !scopeId) {
      return interaction.reply(await this.manager.lang.buildMessage({
        key: 'messages.meta.scope-required',
        ephemeral: true,
        variables: [
          { name: "meta_mode", value: meta.mode }
        ],
        context
      }));
    }

    switch (subcommand) {
      case "set": {
        const value = Utils.blockPlaceholders(interaction.options.getString("value", true));
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, value, scopeId);
        await meta.setValue(value);

        return interaction.reply(await this.manager.lang.buildMessage({
          key: 'messages.meta.set',
          ephemeral: true,
          variables: [
            { name: "meta_key", value: key },
            { name: "meta_value", value: value },
            { name: "meta_mode", value: meta.mode },
            { name: "meta_type", value: meta.type }
          ],
          context
        }));
      }

      case "add":
      case "subtract": {
        const value = interaction.options.getInteger("value", true);
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, '0', scopeId);
        await meta[subcommand](value); // dynamic call to .add() or .subtract()
        
        return interaction.reply(await this.manager.lang.buildMessage({
          key: `messages.meta.${subcommand}`,
          ephemeral: true,
          variables: [
            { name: "meta_key", value: key },
            { name: "meta_value", value: value.toString() },
            { name: "meta_mode", value: meta.mode }
          ],
          context
        }));
      }

      case "toggle": {
        const value = interaction.options.getBoolean("value", true);
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, value.toString(), scopeId);
        await meta.toggle(value);
        return interaction.reply(await this.manager.lang.buildMessage({
          key: 'messages.meta.toggle',
          ephemeral: true,
          variables: [
            { name: "meta_key", value: key },
            { name: "meta_value", value: value ? "true" : "false" },
            { name: "meta_mode", value: meta.mode }
          ],
          context
        }));
      }

      case "list-add": {
        const value = Utils.blockPlaceholders(interaction.options.getString("value", true));
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, "[]", scopeId);
        await meta.listAdd(value);
        return interaction.reply(await this.manager.lang.buildMessage({
          key: 'messages.meta.list-add',
          ephemeral: true,
          variables: [
            { name: "meta_key", value: key },
            { name: "meta_value", value: value },
            { name: "meta_mode", value: meta.mode }
          ],
          context
        }));
      }

      case "list-remove": {
        const value = Utils.blockPlaceholders(interaction.options.getString("value", true));
        const meta = await this.manager.services.engine.metaHandler.findOrCreate(key, "[]", scopeId);
        await meta.listRemove(value);
        return interaction.reply(await this.manager.lang.buildMessage({
          key: 'messages.meta.list-remove',
          ephemeral: true,
          variables: [
            { name: "meta_key", value: key },
            { name: "meta_value", value: value },
            { name: "meta_mode", value: meta.mode }
          ],
          context
        }));
      }

      case "remove": {
        const meta = await MetaData.findOne({ where: { key, scopeId } });
        await meta?.destroy();

        return interaction.reply(await this.manager.lang.buildMessage({
          key: 'messages.meta.remove',
          ephemeral: true,
          variables: [
            { name: "meta_key", value: key },
          ],
          context
        }));
      }
    }
  }
}

