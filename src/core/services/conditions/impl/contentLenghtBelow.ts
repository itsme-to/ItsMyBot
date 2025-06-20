import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class ContentLengthBelowCondition extends Condition {
  id = "contentLengthBelow";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getNumberOrNull("value")
    if (arg === undefined) return condition.missingArg("value");
    if (!context.content) return false

    return context.content.length < arg;
  }
}