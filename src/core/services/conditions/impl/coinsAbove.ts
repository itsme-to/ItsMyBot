import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class CoinsAboveCondition extends Condition {
  id = "coinsAbove";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.user) return condition.missingContext("user");
    const amount = condition.args.getNumberOrNull("amount");
    if (!amount) return condition.missingArg("amount");

    return context.user.coins > amount;
  }
}