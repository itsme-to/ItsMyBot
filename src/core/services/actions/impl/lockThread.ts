import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class LockThreadAction extends Action {
  id = "lockThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    await context.channel.setLocked(true, `Thread locked by action: ${script.id}`);
  }
}