import { Condition, ConditionArgumentValidator, ConditionData, Context, Variable } from '@itsmybot';
import { IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  input: string

  @IsDefined()
  @IsString({ each: true })
  output: string | string[]
  
  @IsOptional()
  @IsBoolean()
  'ignore-case': boolean
}

export default class TextContainsCondition extends Condition {
  id = "textContains";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const input = condition.args.getString("input")
    const output = condition.args.getStrings("output");
    if (!context.content) return false

    const ignoreCase = condition.args.getBoolOrNull("ignore-case") ?? false;

    if (ignoreCase) {
      return output.some(text => input.toLowerCase().includes(text.toLowerCase()));
    }

    return output.some(text => input.includes(text));
  }
}