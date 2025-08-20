import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class HasPermissionCondition extends Condition {
  id = "hasPermission";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.member) return condition.missingContext("member");

    const permissionsArg = condition.config.getStringsOrNull("value");
    if (!permissionsArg) return condition.missingArg("value");

    for (const permissionArg in permissionsArg) {
      const permission = Utils.getPermissionFlags(permissionArg)
      if (!permission) {
        condition.logger.warn(`The permission '${permissionArg}' don't exist.`)
        continue
      }

      if (context.member.permissions.has(permission)) return true
    }

    return false
  }
}