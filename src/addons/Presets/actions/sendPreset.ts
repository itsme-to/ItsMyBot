import { Action, ActionArgumentsValidator, ActionData, Context, Variable, Utils } from '@itsmybot';
import PresetsAddon from '..';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString()
  preset: string;
}

export default class sendPreset extends Action<PresetsAddon> {
  id = "sendPreset";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
      if (!context.channel || !context.channel.isTextBased() || context.channel.isDMBased()) return script.missingContext("channel", context);

      const presetConfig = this.addon.configs.presets.get(script.args.getString('preset'));
      if (!presetConfig) {
        script.logError(`Tried to send preset message for preset path "${script.args.getString('preset')}", but preset config not found.`);
        return;
      }
  
      const message = await context.channel.send(await Utils.setupMessage({ config: presetConfig, context, variables }));
  
      const newContext: Context = {
        ...context,
        message,
        content: message.content,
        channel: message.channel
      };
  
      this.triggerFollowUpActions(script, newContext, variables);
  }
}

