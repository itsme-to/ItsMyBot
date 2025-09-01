import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString()
  value: string;
}

export default class ResetCooldownAction extends Action {
  id = "resetCooldown";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const cooldownId = script.args.getString("value");

    const user = context.user
    if (!user) return script.missingContext("user", context);

    const cooldown = this.manager.services.engine.cooldowns.get(cooldownId);
    if (cooldown) {
      cooldown.reset(user.id);
    }
  }
}