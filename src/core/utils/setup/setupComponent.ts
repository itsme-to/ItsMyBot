import Utils from '@utils';
import { StringSelectMenuBuilder } from 'discord.js';
import manager, { Config, Context, Variable } from '@itsmybot';

interface ComponentSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export async function setupComponent(settings: ComponentSettings) {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const type = config.getStringOrNull("type") || "button";
  const customId = config.getStringOrNull("custom-id");
  const disabled = config.getBoolOrNull("disabled") || false;

  const conditionConfig = config.getSubsections("conditions");
  if (conditionConfig) {
    const conditions = manager.services.condition.buildConditions(conditionConfig, false);
    const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
    if (!isMet) return
  }

  switch (type) {
    case "button": {
      return Utils.setupButton({ config, variables, context });
    }

    case "select-menu": {
      const placeholder = config.getStringOrNull("placeholder");
      const minSelect = config.getNumberOrNull("min-values") || 0;
      const maxSelect = config.getNumberOrNull("max-values") || 1;
      const options = config.getSubsectionsOrNull("options");

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

            const conditionConfig = option.getSubsections("conditions");
            if (conditionConfig) {
              const conditions = manager.services.condition.buildConditions(conditionConfig, false);
              const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
              if (!isMet) continue;
            }

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