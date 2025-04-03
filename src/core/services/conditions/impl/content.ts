import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class ContentCondition extends Condition {
  id = "content";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getStringsOrNull("value")
    if (!arg) return condition.missingArg("value");
    if (!context.content) return false

    const ignoreCase = condition.args.getBoolOrNull("ignore-case") ?? false;
    if (ignoreCase) {
      return arg && arg.some(text => context.content?.toLowerCase() === text.toLowerCase());
    }

    return arg && arg.some(text => context.content === text);
  }
}