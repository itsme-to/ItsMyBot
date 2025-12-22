import { Condition, ConditionArgumentValidator, ConditionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsNumber, IsPositive, IsString, Min } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  text: string

  @IsDefined()
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number
}

export default class TextLenghtBelowCondition extends Condition {
  id = "textLenghtBelow";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const text = condition.args.getString("text")
    const arg = condition.args.getNumber("lenght");

    return text.length < arg;
  }
}