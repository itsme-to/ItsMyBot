import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class EditMessageAction extends Action {
  id = "editMessage";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);

    const message = await context.message.edit(await Utils.setupMessage({ config: script.args, context, variables }));

    const newContext: Context = {
      ...context,
      message,
      content: message.content,
      channel: message.channel
    };

    this.triggerFollowUpActions(script, newContext, variables);
  }
}