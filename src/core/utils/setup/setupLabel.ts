import { Config, Context, Variable, Utils, LabelComponentBuilder } from '@itsmybot';
import { LabelBuilder } from 'discord.js';

interface TextDisplaySettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export async function setupLabel(settings: TextDisplaySettings)  {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;
  const description = config.getStringOrNull('description', true);


  const label = new LabelBuilder()
    .setLabel(await Utils.applyVariables(config.getString('label', true), variables, context))
    
  if (description) label.setDescription(await Utils.applyVariables(description, variables, context));

  const components = await Utils.setupComponent<LabelComponentBuilder>({ config: config.getSubsection('component'), variables, context });
  if (components?.length) label.data.component = components[0];

  return label
}