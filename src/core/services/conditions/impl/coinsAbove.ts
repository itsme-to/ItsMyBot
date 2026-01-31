import { Condition, ConditionArgumentValidator, ConditionData, Context, IsNumberOrString, Utils, Variable } from '@itsmybot';
import { IsDefined, Validate } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @Validate(IsNumberOrString)
  amount: number | string
}

export default class CoinsAboveCondition extends Condition {
  id = "coinsAbove";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.user) return condition.missingContext("user");
    const amount = condition.args.getString("amount");

    const evaluatedAmount = Utils.evaluateNumber(await Utils.applyVariables(amount, variables, context));
    if (evaluatedAmount === null) return condition.missingArg("amount");

    return context.user.coins > evaluatedAmount;
  }
}