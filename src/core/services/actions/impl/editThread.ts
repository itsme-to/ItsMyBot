import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class EditThreadAction extends Action {
  id = "editThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {

    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);

    return context.channel.edit({
      name: await Utils.applyVariables(script.args.getString("value", true), variables, context),
      autoArchiveDuration: script.args.getNumberOrNull("duration"),
      appliedTags: script.args.has("tags") ? await Promise.all(script.args.getStrings("tags").map(async tag => await Utils.applyVariables(tag, variables, context))) : undefined
    });
  }
}