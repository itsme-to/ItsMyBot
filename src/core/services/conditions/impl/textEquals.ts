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

export default class TextEqualsCondition extends Condition {
  id = "textEquals";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const input = condition.args.getString("input")
    const output = condition.args.getStrings("output");

    const ignoreCase = condition.args.getBoolOrNull("ignore-case") ?? false;

    if (ignoreCase) {
      return output.some(text => input.toLowerCase() === text.toLowerCase());
    }

    return output.some(text => input === text);
  }
}