import { Condition, ConditionData, Context, Variable, ConditionArgumentValidator, Utils } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString({ each: true })
  value: string | string[]
}

export default class HasTagCondition extends Condition {
  id = "hasTag";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return condition.missingContext("channel");
    let tags = condition.args.getStrings("value");

    const channelTags = context.channel.appliedTags;
    tags = await Promise.all(tags.map(tag => Utils.applyVariables(tag, variables, context)));

    return tags.some(tag => channelTags.includes(tag))
  }
}