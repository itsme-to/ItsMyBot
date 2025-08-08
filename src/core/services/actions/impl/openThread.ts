import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class OpenThreadAction extends Action {
  id = "openThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    await context.channel.setArchived(false, `Thread opened by action: ${script.id}`);
  }
}