import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { manager, Config, Context, Variable, Utils } from '@itsmybot';

interface SelectMenuSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}
/**
 * Setup a select menu with the given settings
 */
export async function setupSelectMenu(settings: SelectMenuSettings) {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const customId = await Utils.applyVariables(config.getString("custom-id"), variables, context);
  const disabled = config.getBoolOrNull("disabled") || false;

  const placeholder = await Utils.applyVariables(config.getStringOrNull("placeholder", true), variables, context);
  const minSelect = config.getNumberOrNull("min-values")
  const maxSelect = config.getNumberOrNull("max-values") || 1;
  const options = config.getSubsectionsOrNull("options");

  const dataSource = config.getStringOrNull("data-source");
  const template = config.getSubsectionOrNull("template");

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setDisabled(disabled);
    
  if (minSelect) selectMenu.setMinValues(minSelect);

  if (placeholder) selectMenu.setPlaceholder(placeholder);

  if (dataSource && template) {
    const data = context.data?.get(dataSource);
    if (!data) {
      config.logger.warn(`Repeat data source "${dataSource}" not found.`);
      return
    }
    for (const item of data) {
      const varbles = [...variables, ...item.variables]
      const ctxt = { ...context, ...item.context }

      const optionData = await setupOption(template, varbles, ctxt);
      if (!optionData) continue;
      selectMenu.addOptions(optionData);
    }
  } else if (options && options[0]) {
    for (const option of options) {
      const optionData = await setupOption(option, variables, context);
      if (!optionData) continue;

      selectMenu.addOptions(optionData);
    }
  }

  if (!selectMenu.options.length) return

  if (maxSelect > selectMenu.options.length) {
    selectMenu.setMaxValues(selectMenu.options.length);
  } else {
    selectMenu.setMaxValues(maxSelect);
  }

  return selectMenu;
}


async function setupOption(
  config: Config,
  variables: Variable[],
  context: Context,
) {
  const label = await Utils.applyVariables(config.getString("label"), variables, context)
  const value = await Utils.applyVariables(config.getString("value"), variables, context)
  const emoji = await Utils.applyVariables(config.getStringOrNull("emoji"), variables, context);
  const defaultOption = await Utils.applyVariables(config.getStringOrNull("default"), variables, context);
  const description = await Utils.applyVariables(config.getStringOrNull("description"), variables, context);

  const conditionConfig = config.getSubsectionsOrNull("conditions");
  if (conditionConfig) {
    const conditions = manager.services.condition.parseConditions(conditionConfig, false);
    const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
    if (!isMet) return null;
  }
  
  const option = new StringSelectMenuOptionBuilder()
    .setLabel(label)
    .setValue(value);

  try {
    option.setDefault(Utils.evaluateBoolean(defaultOption) || false);
  } catch (error) { }

  if (emoji && Utils.isValidEmoji(emoji)) option.setEmoji(emoji);
  if (description && description !== 'undefined') option.setDescription(description);

  return option;
}