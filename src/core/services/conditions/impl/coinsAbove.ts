import { Condition, ConditionArgumentValidator, ConditionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsNumber, IsPositive, Min } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number
}

export default class CoinsAboveCondition extends Condition {
  id = "coinsAbove";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.user) return condition.missingContext("user");
    const amount = condition.args.getNumber("amount");

    return context.user.coins > amount;
  }
}