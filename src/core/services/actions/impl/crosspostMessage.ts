import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class CrosspostMessageAction extends Action {
  id = "crosspostMessage";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);
    if (context.message.crosspostable) await context.message.crosspost();
  }
}