import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class CoinsBelowCondition extends Condition {
  id = "coinsBelow";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.user) return condition.missingContext("user");
    const amount = condition.args.getNumberOrNull("value");
    if (!amount) return condition.missingArg("value");

    return context.user.coins < amount;
  }
}