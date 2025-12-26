import { Condition, ConditionArgumentValidator, ConditionData, Context, Utils, Variable } from '@itsmybot';
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

export default class TextStartsWithCondition extends Condition {
  id = "textStartsWith";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const input = await Utils.applyVariables(condition.args.getString("input"), variables, context);
    const output = await Promise.all(condition.args.getStrings("output").map(async (text) => await Utils.applyVariables(text, variables, context)));
    
    const ignoreCase = condition.args.getBoolOrNull("ignore-case") ?? false;

    if (ignoreCase) {
      return output.some(text => input.toLowerCase().startsWith(text.toLowerCase()));
    }

    return output.some(text => input.startsWith(text));
  }
}