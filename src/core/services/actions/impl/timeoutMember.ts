import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { IsDefined, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';


class ArgumentsValidator extends ActionArgumentsValidator {
  @IsOptional()
  @IsString({ each: true})
  value: string | string[]

  @IsDefined()
  @IsInt()
  @IsPositive()
  duration: number
}


export default class TimeoutMemberAction extends Action {
  id = "timeoutMember";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const duration = script.args.getNumberOrNull("duration");
    let reason = script.args.getStringOrNull("value");

    reason = await Utils.applyVariables(reason, variables, context);

    if (!context.member) return script.missingContext("member", context);
    if (!duration) return script.missingArg("duration", context);

    await context.member.timeout(duration, reason);
  }
}