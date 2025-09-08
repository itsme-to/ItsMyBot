import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { IsOptional, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsOptional()
  @IsString({ each: true})
  value: string | string[]
}

export default class RemoveReactionAction extends Action {
  id = "removeReaction";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);

    const emoji = await Utils.applyVariables(script.args.getStringOrNull('value'), variables, context)

    return emoji
      ? context.message.reactions.cache.get(emoji)?.remove()
      : context.message.reactions.removeAll();
  }
}