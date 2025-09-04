import { Condition, ConditionArgumentValidator, ConditionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  value: string
}

export default class IsOnCooldownCondition extends Condition {
  id = "isOnCooldown";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const cooldownId = condition.args.getString("value");

    const user = context.user;
    if (!user) return condition.missingContext("user");

    const cooldowns = this.manager.services.engine.cooldowns.get(cooldownId);
    if (!cooldowns) return false;

    return cooldowns.isOnCooldown(user.id)
  }
}