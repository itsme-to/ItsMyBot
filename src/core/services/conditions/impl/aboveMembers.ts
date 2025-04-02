import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class AboveMembersCondition extends Condition {
  id = "aboveMembers";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.guild) return condition.missingContext("guild");
    const amount = condition.args.getNumberOrNull("amount");
    if (!amount) return condition.missingArg("amount");

    return context.guild.memberCount > amount;
  }
}