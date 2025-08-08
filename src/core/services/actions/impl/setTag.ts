import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class SetTagAction extends Action {
  id = "setTag";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    const tags = script.args.getStringsOrNull("value")
    if (!tags) return script.missingArg("value", context);

    const parsedTag: string[] = []

    await Promise.all(tags.map(async tag => {
      const resolvedTag = await Utils.applyVariables(tag, variables, context);
        parsedTag.push(resolvedTag);
    }));

    await context.channel.setAppliedTags(parsedTag, `Tags added by action: ${script.id}`);
  }
}