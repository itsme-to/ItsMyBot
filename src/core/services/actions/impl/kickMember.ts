import { Action, ActionData, Context, Variable, ActionArgumentsValidator } from '@itsmybot';
import Utils from '@utils';
import { IsOptional, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsOptional()
  @IsString({ each: true})
  value: string | string[]
}

export default class KickMemberAction extends Action {
  id = "kickMember";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    let reason = script.args.getStringOrNull("value");
    reason = await Utils.applyVariables(reason, variables, context);

    if (!context.member) return script.missingContext("member", context);

    if (context.member.kickable) {
      await context.member.kick(reason);
    }
  }
}