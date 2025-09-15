import { Action, ActionData, Context, FollowUpActionArgumentsValidator, Variable, Utils } from '@itsmybot';

export default class EditMessageAction extends Action {
  id = "editMessage";
  argumentsValidator = FollowUpActionArgumentsValidator;

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