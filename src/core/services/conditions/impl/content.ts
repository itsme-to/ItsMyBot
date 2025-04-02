import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class ContentCondition extends Condition {
  id = "content";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getStringsOrNull("value")
    if (!arg) return condition.missingArg("value");
    if (!context.content) return condition.missingContext("content");

    return arg && arg.some(text => context.content === text);
  }
}