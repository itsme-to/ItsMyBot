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

export default class ContentEndsWithCondition extends Condition {
  id = "contentEndsWith";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getStrings("value");
    if (!arg) return condition.missingArg("value");
    if (!context.content) return false

    const ignoreCase = condition.args.getBoolOrNull("ignore-case") ?? false;

    if (ignoreCase) {
      return arg && arg.some(text => context.content?.toLowerCase().endsWith(text.toLowerCase()));
    }

    return arg && arg.some(text => context.content?.endsWith(text));
  }
}