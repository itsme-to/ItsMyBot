import { Action, ActionData, Context, FollowUpActionArgumentsValidator, Variable, Utils } from '@itsmybot';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

class ArgumentsValidator extends FollowUpActionArgumentsValidator {
  @IsOptional()
  @IsString({ each: true})
  value: string | string[]

  @IsOptional()
  @IsInt()
  @IsPositive()
  duration: number
}

export default class StartThreadAction extends Action {
  id = "startThread";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);

    const thread = await context.message.startThread({
      name: await Utils.applyVariables(script.args.getStringOrNull("value"), variables, context) || "Thread",
      autoArchiveDuration: script.args.getNumberOrNull("duration") || 60
    });

    const newContext: Context = {
      ...context,
      content: thread.name,
      channel: thread
    };

    this.triggerFollowUpActions(script, newContext, variables);
  }
}