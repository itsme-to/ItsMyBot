import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class CloseThreadAction extends Action {
  id = "closeThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    await context.channel.setArchived(true, `Thread closed by action: ${script.id}`);
  }
}