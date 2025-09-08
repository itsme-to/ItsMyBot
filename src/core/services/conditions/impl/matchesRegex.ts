import { Condition, ConditionArgumentValidator, ConditionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString({ each: true })
  value: string | string[]
}

export default class MatchesRegexCondition extends Condition {
  id = "matchesRegex";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getStrings("value")
    if (!context.content) return false

    return arg && arg.some(regex => new RegExp(regex).test(context.content!));
  }
}