import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class ResetCooldownAction extends Action {
  id = "resetCooldown";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const duration = script.args.getNumberOrNull("duration");
    if (!duration) return script.missingArg("duration", context);

    const cooldownId = script.args.getStringOrNull("value");
    if (!cooldownId) return script.missingArg("value", context);

    const user = context.user
    if (!user) return script.missingContext("user", context);

    const cooldown = this.manager.services.engine.cooldowns.get(cooldownId);
    if (cooldown) {
      cooldown.reset(user.id);
    }
  }
}