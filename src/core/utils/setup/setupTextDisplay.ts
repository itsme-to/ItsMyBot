import { Config, Context, Variable, Utils } from '@itsmybot';
import { TextDisplayBuilder } from 'discord.js';

interface TextDisplaySettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export async function setupTextDisplay(settings: TextDisplaySettings)  {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const textDisplay = new TextDisplayBuilder()
    .setContent(await Utils.applyVariables(config.getString('content', true), variables, context))

  return textDisplay
}