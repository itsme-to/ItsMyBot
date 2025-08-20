import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class HasTagCondition extends Condition {
  id = "hasTag";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return condition.missingContext("channel");
    let tags = condition.config.getStringsOrNull("value");
    if (!tags) return condition.missingArg("value");

    const channelTags = context.channel.appliedTags;
    tags = await Promise.all(tags.map(tag => Utils.applyVariables(tag, variables, context)));

    return tags.some(tag => channelTags.includes(tag))
  }
}