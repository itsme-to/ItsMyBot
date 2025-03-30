import { Condition, ConditionData } from '@itsmybot';
import { Context, Variable } from '@contracts';
export default class isUserCondition extends Condition {
  id = "isUser";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.user) return condition.missingContext("user");
    const users = condition.args.getStringsOrNull("value");
    if (!users) return condition.missingArg("value");

    if (users.some((user: string) => user === context.user?.id || user === context.user?.username)) {
      return true
    }

    return false
  }
}