import { Action, ActionData, Context, ActionArgumentsValidator, Variable, Utils } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true })
  value: string | string[]
}

export default class AddReactionAction extends Action {
  id = "addReaction";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const value = script.args.getString("value");

    if (!context.message) return script.missingContext("message", context);

    const emoji = await Utils.applyVariables(value, variables, context)
    context.message.react(emoji);
  }
}