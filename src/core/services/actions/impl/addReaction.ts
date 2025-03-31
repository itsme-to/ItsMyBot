import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class AddReactionAction extends Action {
  id = "addReaction";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const value = script.args.getStringOrNull("value");

    if (!context.message) return script.missingContext("message", context);
    if (!value) return script.missingArg("value", context);

    const emoji = await Utils.applyVariables(value, variables, context)
    context.message.react(emoji);
  }
}