import { ActionRowBuilder, MessageFlags, MessageActionRowComponentBuilder } from 'discord.js';
import { Config, Context, Variable, MessageOutput, TopLevelComponentBuilder, Utils } from '@itsmybot';

interface MessageSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
  allowedMentions?: any,
  ephemeral?: boolean
  components?: any[],
  files?: any[],
  disableMentions?: boolean
}

export async function setupMessage(settings: MessageSettings): Promise<MessageOutput> {
  const message: MessageOutput = {
    content: undefined,
    embeds: [],
    components: [],
    files: [],
    allowedMentions: settings.allowedMentions || undefined,
    poll: undefined,
  };

  const flags = []
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const ephemeral = config.getBoolOrNull("ephemeral") || settings.ephemeral || false;
  if (ephemeral) {
    flags.push(MessageFlags.Ephemeral);
  }
  
  const disableMentions = config.getBoolOrNull("disable-mentions") || settings.disableMentions || false;
  if (disableMentions) message.allowedMentions = { parse: [] }

  if (flags) {
    message.flags = flags.reduce((acc: number, flag: number) => acc | flag, 0);
  }

  const files = config.getStringsOrNull("files") || [];
  for (const file of files) {
    message.files.push(await Utils.applyVariables(file, variables, context));
  }

  if (settings.files && settings.files[0]) message.files.push(...settings.files);

  const componentsConfig = config.getSubsectionsOrNull("components");
  const components = []
  if (componentsConfig?.length) {
    for (const componentConfig of componentsConfig) {
      const component = await Utils.setupComponent<TopLevelComponentBuilder>({
        config: componentConfig,
        variables: variables,
        context: context,
      });
      if (component?.length) components.push(...component);
    }


    if (settings.components && settings.components[0]) components.push(...settings.components);

    if (components.length) {
      message.components.push(...components);
      message.flags |= MessageFlags.IsComponentsV2;

      return message;
    }
  }

  let content = config.getStringOrNull("content", true)
  if (content) {
    content = await Utils.applyVariables(content, variables, context);

    if (content.length > 2000) content = content.substring(0, 1997) + "...";

    message.content = content;
  }

  const embeds = config.getSubsectionsOrNull("embeds") || [];
  if (embeds && embeds[0]) {
    for (const embedConfig of embeds) {
      const embed = await Utils.setupEmbed({
        config: embedConfig,
        variables: variables,
        context: context,
      });
      if (embed) message.embeds.push(embed);
    }
  }

  const actionRows = [];
  const rows = Array.from({ length: 5 }, () => new ActionRowBuilder());
  const configComponents = config.getSubsectionOrNull("action-rows")?.values || [];

  for (const [i, values] of configComponents) {
    const row = rows[(parseInt(i) - 1)];
    
    if (!row || !Array.isArray(values) || !values.length) continue;

    for (const component of values) {
      if (!component || typeof component !== 'object') continue;
      const buildComponent = await Utils.setupComponent<MessageActionRowComponentBuilder>({
        config: component,
        variables: variables,
        context: context,
      });
      if (buildComponent?.length) row.addComponents(buildComponent);
    }
  }

  const validRows = rows.filter(row => row.components.length && row.components.length <= 5);
  if (validRows.length) actionRows.push(...validRows);
  if (settings.components && settings.components[0]) actionRows.push(...settings.components);
  if (actionRows.length) message.components = actionRows;

  return message;
};
