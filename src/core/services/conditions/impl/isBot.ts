import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class IsBotCondition extends Condition {
  id = "isBot";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.member) return condition.missingContext("member");

    return context.member.user.bot;
  }
}