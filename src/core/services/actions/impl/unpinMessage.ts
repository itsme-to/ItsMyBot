import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class UnpinMessageAction extends Action {
  id = "unpinMessage";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);

    await context.message.unpin();
  }
}