import { ColorResolvable, EmbedBuilder } from 'discord.js';
import manager, { Config, Context, Variable } from '@itsmybot';
import Utils from '@utils';

interface EmbedSettings {
  config: Config,
  variables?: Variable[],
  context: Context
}

export async function setupEmbed(settings: EmbedSettings) {
  const variables = settings.variables || []
  const context = settings.context;
  const config = settings.config;

  const conditionConfig = config.getSubsectionsOrNull("conditions");
  if (conditionConfig) {
    const conditions = manager.services.condition.buildConditions(conditionConfig, false);
    const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
    if (!isMet) {
      return null;
    }
  }

  const author = config.getStringOrNull("author", true);
  const authorIcon = config.getStringOrNull("author-icon", true);
  const authorUrl = config.getStringOrNull("author-url", true);
  const url = config.getStringOrNull("url", true);
  const title = config.getStringOrNull("title", true);
  let description = config.getStringOrNull("description", true);
  const fields = config.getSubsectionsOrNull("fields");
  const footer = config.getStringOrNull("footer", true);
  const footerIcon = config.getStringOrNull("footer-icon", true);
  const thumbnail = config.getStringOrNull("thumbnail", true);
  const image = config.getStringOrNull("image", true);
  const timestamp = config.getBoolOrNull("timestamp");
  const color = config.getStringOrNull("color", true);

  description = await Utils.applyVariables(description, variables, context);

  const embed = new EmbedBuilder()
    .setTitle(await Utils.applyVariables(title, variables, context) || null)
    .setDescription(description || null)
    .setAuthor({
      name: await Utils.applyVariables(author, variables, context) || null!,
      iconURL: await Utils.applyVariables(authorIcon, variables, context) || undefined,
      url: await Utils.applyVariables(authorUrl, variables, context) || undefined,
    })
    .setFooter({
      text: await Utils.applyVariables(footer, variables, context) || null!,
      iconURL: await Utils.applyVariables(footerIcon, variables, context) || undefined,
    })
    .setImage(await Utils.applyVariables(image, variables, context) || null)
    .setThumbnail(await Utils.applyVariables(thumbnail, variables, context) || null)
    .setTimestamp(timestamp ? Date.now() : null)
    .setColor(await Utils.applyVariables(color, variables, context) as ColorResolvable || null)
    .setURL(await Utils.applyVariables(url, variables, context) || null);

  if (Array.isArray(fields)) {
    for (const field of fields) {
      const conditionConfig = field.getSubsectionsOrNull("conditions");
      if (conditionConfig) {
        const conditions = manager.services.condition.buildConditions(conditionConfig, false);
        const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
        if (!isMet) continue;
      }

      embed.addFields({
        name: await Utils.applyVariables(field.getString("name", true), variables, context),
        value: await Utils.applyVariables(field.getString("value", true), variables, context),
        inline: field.getBoolOrNull("inline") || false,
      });
    }
  }

  return embed.data;
};
