import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class ContentEqualsCondition extends Condition {
  id = "contentEquals";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.config.getStringsOrNull("value")
    if (!arg) return condition.missingArg("value");
    if (!context.content) return false

    const ignoreCase = condition.config.getBoolOrNull("ignore-case") ?? false;
    if (ignoreCase) {
      return arg && arg.some(text => context.content?.toLowerCase() === text.toLowerCase());
    }

    return arg && arg.some(text => context.content === text);
  }
}