import Utils from '@utils';
import manager, { Config, Context, Variable } from '@itsmybot';
import { ContainerBuilder, ContainerComponentBuilder } from 'discord.js';

interface ContainerSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export async function setupContainer(settings: ContainerSettings)  {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const colorString = config.getStringOrNull("color", true) || manager.configs.config.getString("default-color");
  const color = colorString ? parseInt(colorString.replace(/^#/, ''), 16) : undefined;

  const container = new ContainerBuilder()
    .setSpoiler(config.getBoolOrNull("spoiler") || false)

  if (color) container.setAccentColor(color);

  for (const componentConfig of config.getSubsections("components")) {
    const component = await Utils.setupComponent<ContainerComponentBuilder>({ config: componentConfig, variables, context });
    if (component) container.components.push(component);
  }

  return container
}