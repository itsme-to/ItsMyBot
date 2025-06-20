import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class isBoosterCondition extends Condition {
  id = "isBooster";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.member) return condition.missingContext("member");

    return !!context.member.premiumSince;
  }
}