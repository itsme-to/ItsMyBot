import { Action, ActionArgumentsValidator, ActionData, Context, Variable, Utils } from '@itsmybot';
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
    const duration = script.args.getNumber("duration");
    const reason = await Utils.applyVariables(script.args.getStringOrNull("value"), variables, context);

    if (!context.member) return script.missingContext("member", context);

    await context.member.timeout(duration, reason);
  }
}