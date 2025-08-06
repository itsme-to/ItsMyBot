import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class StartThreadAction extends Action {
  id = "startThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);

    const thread = await context.message.startThread({
      name: await Utils.applyVariables(script.args.getString("value"), variables, context) || "Thread",
      autoArchiveDuration: script.args.getNumberOrNull("duration") || 60
    });

    const newContext: Context = {
      ...context,
      content: thread.name,
      channel: thread
    };

    this.triggerActions(script, newContext, variables);
  }
}