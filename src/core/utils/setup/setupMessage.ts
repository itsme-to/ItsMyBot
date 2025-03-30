import { ActionRowBuilder, MessageFlags } from 'discord.js';
import { Config } from '@itsmybot';
import Utils from '@utils';
import { Context, Variable, MessageOutput } from '@contracts';

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
    flags: []
  };

  const variables = settings.variables || [];
  const context = settings.context;

  let content = settings.config.getStringOrNull("content", true)
  if (content) {
    content = await Utils.applyVariables(content, variables, context);

    if (content.length > 2000) content = content.substring(0, 1997) + "...";

    message.content = Utils.removeHiddenLines(content);
  }

  const embeds = settings.config.getSubsectionsOrNull("embeds") || [];
  if (embeds && embeds[0]) {
    for (const embed of embeds) {
      message.embeds.push(await Utils.setupEmbed({
        config: embed,
        variables: variables,
        context: context,
      }));
    }
  }

  const ephemeral = settings.config.getBoolOrNull("ephemeral") || settings.ephemeral || false;
  if (ephemeral) {
    message.flags.push(MessageFlags.Ephemeral);
  }

  const components = [];
  const rows = Array.from({ length: 5 }, () => new ActionRowBuilder());
  const configComponents = settings.config.getSubsectionOrNull("components")?.values || [];

  for (const [i, values] of configComponents) {
    const row = rows[(parseInt(i) - 1)];

    if (!row || !Array.isArray(values) || !values.length) continue;

    for (const component of values) {
      const buildComponent = await Utils.setupComponent({
        config: component,
        variables: variables,
        context: context,
      });
      if (!buildComponent) continue;
      row.addComponents(buildComponent);
    }
  }

  const validRows = rows.filter(row => row.components.length && row.components.length <= 5);
  if (validRows.length) components.push(...validRows);
  if (settings.components && settings.components[0]) components.push(...settings.components);

  if (components.length) message.components = components;

  const files = settings.config.getStringsOrNull("files") || [];
  for (const file of files) {
    message.files.push(await Utils.applyVariables(file, variables, context));
  }
  if (settings.files && settings.files[0]) message.files.push(...settings.files);

  const disableMentions = settings.config.getBoolOrNull("disable-mentions") || settings.disableMentions || false;
  if (disableMentions) message.allowedMentions = { parse: [] }

  return message;
};
