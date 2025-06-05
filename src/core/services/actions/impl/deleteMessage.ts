import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class DeleteMessageAction extends Action {
  id = "deleteMessage";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);

    await context.message.delete();
  }
}