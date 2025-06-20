import { Action, ActionData, Context, Variable } from '@itsmybot';
import { Cooldown } from '@utils';

export default class SetCooldownAction extends Action {
  id = "setCooldown";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const duration = script.args.getNumberOrNull("duration");
    if (!duration) return script.missingArg("duration", context);

    const cooldownId = script.args.getStringOrNull("value");
    if (!cooldownId) return script.missingArg("value", context);

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