import { Condition, ConditionArgumentValidator, ConditionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsNumber, IsPositive, Min } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number
}
export default class ContentLengthBelowCondition extends Condition {
  id = "contentLengthBelow";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    condition.logWarning('The "contentLengthBelow" condition is deprecated. Please use the "textLengthBelow" condition instead.');

    const arg = condition.args.getNumber("amount");
    if (!context.content) return false

    return context.content.length < arg;
  }
}