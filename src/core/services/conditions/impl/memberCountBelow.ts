import { Condition, ConditionArgumentValidator, ConditionData, Context, IsNumberOrString, Utils, Variable } from '@itsmybot';
import { IsDefined, Validate } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @Validate(IsNumberOrString)
  amount: number
}

export default class MemberCountBelowCondition extends Condition {
  id = "memberCountBelow";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.guild) return condition.missingContext("guild");
    const amount = condition.args.getString("amount");

    const parsedAmount = Utils.evaluateNumber(await Utils.applyVariables(amount, variables, context));
    if (parsedAmount === null) return condition.missingArg("amount");

    return context.guild.memberCount < parsedAmount;
  }
}