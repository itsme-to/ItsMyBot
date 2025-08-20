import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class ContentStartsWithCondition extends Condition {
  id = "contentStartsWith";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.config.getStringsOrNull("value")
    if (!arg) return condition.missingArg("value");
    if (!context.content) return false

    return arg && arg.some(text => context.content?.startsWith(text));
  }
}