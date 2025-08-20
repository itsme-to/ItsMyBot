import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class MemberCountBelowCondition extends Condition {
  id = "memberCountBelow";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.guild) return condition.missingContext("guild");
    const amount = condition.config.getNumberOrNull("amount");
    if (!amount) return condition.missingArg("amount");

    return context.guild!.memberCount < amount;
  }
}