import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class SendMessageAction extends Action {
  id = "sendMessage";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isTextBased() || context.channel.isDMBased()) return script.missingContext("channel", context);

    const message = await context.channel.send(await Utils.setupMessage({ config: script.args, context, variables }));

    const newContext: Context = {
      ...context,
      message,
      content: message.content,
      channel: message.channel
    };

    this.triggerFollowUpActions(script, newContext, variables);
  }
}