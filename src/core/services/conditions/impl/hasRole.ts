import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class HasRoleCondition extends Condition {
  id = "hasRole";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.member) return condition.missingContext("member");
    const role = condition.config.getStringsOrNull("value");
    if (!role) return condition.missingArg("value");

    return Utils.hasRole(context.member, role, condition.config.getBoolOrNull("inherit"));
  }
}