import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class RegexCondition extends Condition {
  id = "regex";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getStringsOrNull("value")
    if (!arg) return condition.missingArg("value");
    if (!context.content) return condition.missingContext("content");

    return arg && arg.some(regex => new RegExp(regex).test(context.content!));
  }
}