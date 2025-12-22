import { ModalBuilder } from 'discord.js';
import { Config, Context, Variable, Utils } from '@itsmybot';

interface ModalSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
  customId?: string,
  title?: string
}

export async function setupModal(settings: ModalSettings) {
  const variables = settings.variables || []
  const context = settings.context;

  let customId = settings.customId || settings.config.getString("custom-id");
  let title = settings.title || settings.config.getString("title", true);

  customId = await Utils.applyVariables(customId, variables, context);
  if (!customId) throw new Error(`Custom ID is required for a modal.`);

  title = await Utils.applyVariables(title, variables, context);

  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title);

  const components = settings.config.getSubsections("components");
  for (const component of components) {
    const type = component.getString("type");

    switch (type) {
      case 'text-display': {
        modal.addTextDisplayComponents(await Utils.setupTextDisplay({ config: component, variables, context }));
        break;
      }
      case 'label': {
        modal.addLabelComponents(await Utils.setupLabel({ config: component, variables, context }));
        break;
      }
    }
  }

  return modal;
}
