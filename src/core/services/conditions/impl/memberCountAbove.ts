import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class MemberCountAboveCondition extends Condition {
  id = "memberCountAbove";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.guild) return condition.missingContext("guild");
    const amount = condition.config.getNumberOrNull("amount");
    if (!amount) return condition.missingArg("amount");

    return context.guild.memberCount > amount;
  }
}