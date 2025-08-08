import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class UnlockThreadAction extends Action {
  id = "unlockThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    await context.channel.setLocked(false, `Thread unlocked by action: ${script.id}`);
  }
}