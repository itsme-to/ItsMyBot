import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class RemoveTagAction extends Action {
  id = "removeTag";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    const tags = script.args.getStringsOrNull("value")
    if (!tags) return script.missingArg("value", context);

    const parsedTag = context.channel.appliedTags;
    await Promise.all(tags.map(async tag => {
      const resolvedTag = await Utils.applyVariables(tag, variables, context);
      if (parsedTag.includes(resolvedTag)) {
        parsedTag.splice(parsedTag.indexOf(resolvedTag), 1);
      }
    }));

    await context.channel.setAppliedTags(parsedTag, `Tags removed by action: ${script.id}`);
  }
}