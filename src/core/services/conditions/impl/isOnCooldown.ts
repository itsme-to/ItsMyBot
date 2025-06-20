import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class IsOnCooldownCondition extends Condition {
  id = "isOnCooldown";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const cooldownId = condition.args.getStringOrNull("value");
    if (!cooldownId) return condition.missingArg("value");

    const user = context.user;
    if (!user) return condition.missingContext("user");

    const cooldowns = this.manager.services.engine.cooldowns.get(cooldownId);
    if (!cooldowns) return false;

    return cooldowns.isOnCooldown(user.id)
  }
}