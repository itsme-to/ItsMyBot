import { Condition, ConditionData, Context, Variable, ConditionArgumentValidator, IsPermissionFlag } from '@itsmybot';
import Utils from '@utils';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString({ each: true })
  @Validate(IsPermissionFlag, { each: true })
  permissions: string | string[]
}

export default class HasPermissionCondition extends Condition {
  id = "hasPermission";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.member) return condition.missingContext("member");

    const permissionsArg = condition.args.getStrings("permissions");
    for (const permissionArg of permissionsArg) {
      const permission = Utils.getPermissionFlags(permissionArg)
      if (!permission) continue

      if (context.member.permissions.has(permission)) return true
    }

    return false
  }
}