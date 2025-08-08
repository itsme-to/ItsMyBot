import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class AddTagAction extends Action {
  id = "addTag";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    const tags = script.args.getStringsOrNull("value")
    if (!tags) return script.missingArg("value", context);

    const parsedTag = context.channel.appliedTags;
    await Promise.all(tags.map(async tag => {
      const resolvedTag = await Utils.applyVariables(tag, variables, context);
      if (!parsedTag.includes(resolvedTag)) {
        parsedTag.push(resolvedTag);
      }
    }));

    await context.channel.setAppliedTags(parsedTag, `Tags added by action: ${script.id}`);
  }
}