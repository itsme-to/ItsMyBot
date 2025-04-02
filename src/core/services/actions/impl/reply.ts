import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class ReplyAction extends Action {
  id = "reply";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    let message

    if (context.interaction && context.interaction.isRepliable()) {
      if (context.interaction.replied) {
        message = await context.interaction.followUp(await Utils.setupMessage({ config: script.args, context, variables }));
      } else {
        const reply = await context.interaction.reply(await Utils.setupMessage({ config: script.args, context, variables }))
        message = await reply.fetch();
      }
    } else if (context.message) {
      message = await context.message.reply(await Utils.setupMessage({ config: script.args, context, variables }));
    }

    if (!message) return;

    const newContext: Context = {
      ...context,
      message,
      content: message.content,
      channel: message.channel
    };

    this.triggerActions(script, newContext, variables);
  }
}