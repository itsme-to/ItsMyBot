import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class DeleteThreadAction extends Action {
  id = "deleteThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    await context.channel.delete(`Thread deleted by action: ${script.id}`);
  }
}