import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class MatchesRegexCondition extends Condition {
  id = "matchesRegex";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.config.getStringsOrNull("value")
    if (!arg) return condition.missingArg("value");
    if (!context.content) return false

    return arg && arg.some(regex => new RegExp(regex).test(context.content!));
  }
}