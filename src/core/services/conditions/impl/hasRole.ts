import { Condition, ConditionData, Context, Variable, ConditionArgumentValidator, Utils } from '@itsmybot';
import { IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString({ each: true })
  value: string | string[]

  @IsOptional()
  @IsBoolean()
  inherit: boolean
}

export default class HasRoleCondition extends Condition {
  id = "hasRole";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.member) return condition.missingContext("member");
    const roles = condition.args.getStrings("value");

    return Utils.hasRole(context.member, roles, condition.args.getBoolOrNull("inherit"));
  }
}