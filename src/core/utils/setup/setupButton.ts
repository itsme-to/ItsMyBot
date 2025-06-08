import { ButtonBuilder, ButtonStyle } from 'discord.js';
import Utils from '@utils';
import { Config, Context, Variable } from '@itsmybot';

interface ButtonSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
  customId?: string,
  disabled?: boolean,
  label?: string,
  emoji?: string,
  style?: string,
  url?: string
}

/**
 * Setup a button with the given settings
 */
export async function setupButton(settings: ButtonSettings) {
  const variables = settings.variables || []
  const context = settings.context;
  const config = settings.config;

  let style = settings.style || config.getStringOrNull("style", true);
  let customId = settings.customId || config.getStringOrNull("custom-id", true);
  const disabled = settings.disabled || config.getBoolOrNull("disabled") || false;
  let label = settings.label || settings.config.getStringOrNull("label", true);
  let emoji = settings.emoji || settings.config.getStringOrNull("emoji", true);
  let url = settings.url || settings.config.getStringOrNull("url", true);

  style = await Utils.applyVariables(style, variables, context);
  customId = await Utils.applyVariables(customId, variables, context);
  label = await Utils.applyVariables(label, variables, context);
  emoji = await Utils.applyVariables(emoji, variables, context);
  url = await Utils.applyVariables(url, variables, context);

  const button = new ButtonBuilder()
    .setDisabled(disabled);

  if (url) {
    if (!Utils.isValidURL(url)) {
      button.setStyle(ButtonStyle.Danger);
      button.setLabel("Invalid URL");
      button.setCustomId(`invalid-url--${Math.floor(Math.random() * 10000000)}`);
      button.setDisabled(true);

      return button;
    }

    button.setStyle(ButtonStyle.Link);
    button.setURL(url);
  } else {
    button.setStyle(Utils.getButtonStyle(style) || ButtonStyle.Primary);
    button.setCustomId(customId);
  }

  if (label) button.setLabel(label);
  if (emoji) button.setEmoji(emoji);

  return button;
}
