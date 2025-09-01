import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import { Cooldown } from '@utils';
import { IsDefined, IsNumber, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString()
  value: string;

  @IsDefined()
  @IsNumber()
  duration: number;
}

export default class SetCooldownAction extends Action {
  id = "setCooldown";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const duration = script.args.getNumber("duration");
    const cooldownId = script.args.getString("value");

    const user = context.user
    if (!user) return script.missingContext("user", context);

    const cooldown = this.manager.services.engine.cooldowns.get(cooldownId);
    if (!cooldown) {
      const cooldown = new Cooldown(duration)
      this.manager.services.engine.cooldowns.set(cooldownId, cooldown);
    }

    cooldown?.setCooldown(user.id)
  }
}