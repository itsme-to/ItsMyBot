import Utils from '@utils';
import { Config, Context, Variable } from '@itsmybot';
import { ThumbnailBuilder } from 'discord.js';

interface ThumbnailSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export async function setupThumbnail(settings: ThumbnailSettings)  {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const description = await Utils.applyVariables(config.getStringOrNull('description', true), variables, context)

  const thumbnail = new ThumbnailBuilder()
    .setSpoiler(config.getBoolOrNull('spoiler') || false)
    .setURL(await Utils.applyVariables(config.getString('url', true), variables, context))

  if (description) thumbnail.setDescription(description)

  return thumbnail
}