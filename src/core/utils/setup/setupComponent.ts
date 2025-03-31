import Utils from '@utils';
import { StringSelectMenuBuilder } from 'discord.js';
import { Config, Context, Variable } from '@itsmybot';

interface ComponentSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export async function setupComponent(settings: ComponentSettings) {
  const component = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const type = component.getStringOrNull("type") || "button";
  const customId = component.getStringOrNull("custom-id");
  const disabled = component.getBoolOrNull("disabled") || false;

  const show = await Utils.applyVariables(component.getStringOrNull("show"), variables, context);
  if (show === "false") return;

  switch (type) {
    case "button": {
      return Utils.setupButton({ config: component, variables, context });
    }

    case "select-menu": {
      const placeholder = component.getStringOrNull("placeholder");
      const minSelect = component.getNumberOrNull("min-values") || 0;
      const maxSelect = component.getNumberOrNull("max-values") || 1;
      const options = component.getSubsectionsOrNull("options");

      if (customId) {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(customId)
          .setDisabled(disabled)
          .setMaxValues(maxSelect)
          .setMinValues(minSelect)

        const placeholderValue = await Utils.applyVariables(placeholder, variables, context);
        if (placeholderValue) selectMenu.setPlaceholder(placeholderValue);

        if (options && options[0]) {
          for (const option of options) {
            const label = option.getStringOrNull("label");
            const value = option.getStringOrNull("value");
            const emoji = option.getStringOrNull("emoji");
            const defaultOption = option.getBoolOrNull("default") || false;
            const description = option.getStringOrNull("description");

            const data = {
              label: label ?? await Utils.applyVariables(label, variables, context),
              value: value ?? await Utils.applyVariables(value, variables, context),
              emoji: emoji ? await Utils.applyVariables(emoji, variables, context) : undefined,
              description: description ? await Utils.applyVariables(description, variables, context) : undefined,
              default: defaultOption
            };

            selectMenu.addOptions(data);
          }
        }

        return selectMenu;
      }
    }
  }
}