import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class RemoveReactionAction extends Action {
  id = "removeReaction";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return script.missingContext("message", context);

    const emoji = await Utils.applyVariables(script.args.getStringOrNull('value'), variables, context)

    return emoji
      ? context.message.reactions.cache.get(emoji)?.remove()
      : context.message.reactions.removeAll();
  }
}