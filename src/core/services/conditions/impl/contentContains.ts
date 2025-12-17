import { Condition, ConditionArgumentValidator, ConditionData, Context, Variable } from '@itsmybot';
import { IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString({ each: true })
  value: string | string[]
  
  @IsOptional()
  @IsBoolean()
  'ignore-case': boolean
}

export default class ContentContainsCondition extends Condition {
  id = "contentContains";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    condition.logWarning('The "contentContains" condition is deprecated. Please use the "textContains" condition instead.');

    const arg = condition.args.getStrings("value");
    if (!context.content) return false

    const ignoreCase = condition.args.getBoolOrNull("ignore-case") ?? false;

    if (ignoreCase) {
      return arg && arg.some(text => context.content?.toLowerCase().includes(text.toLowerCase()));
    }

    return arg && arg.some(text => context.content?.includes(text));
  }
}