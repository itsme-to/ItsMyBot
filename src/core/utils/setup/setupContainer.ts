import Utils from '@utils';
import { Config, Context, Variable } from '@itsmybot';
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

  const colorString = config.getStringOrNull("color", true);
  const color = getColor(colorString);

  const container = new ContainerBuilder()
    .setSpoiler(config.getBoolOrNull("spoiler") || false)

  if (color) container.setAccentColor(color);

  for (const componentConfig of config.getSubsections("components")) {
    const components = await Utils.setupComponent<ContainerComponentBuilder>({ config: componentConfig, variables, context });
    if (components?.length) container.components.push(...components);
  }

  return container
}

function getColor(color: string | undefined) {
  if (!color) return undefined;
  if (/^#?[0-9a-fA-F]{6}$/.test(color)) {
    return parseInt(color.replace(/^#/, ''), 16);
  }
  return parseInt(color, 10);
}