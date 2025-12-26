import { Condition, ConditionArgumentValidator, ConditionData, Context, IsNumberOrString, Utils, Variable } from '@itsmybot';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  text: string

  @IsDefined()
  @Validate(IsNumberOrString)
  amount: number | string
}

export default class TextLengthAboveCondition extends Condition {
  id = "textLengthAbove";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const text = await Utils.applyVariables(condition.args.getString("text"), variables, context);
    const amount = condition.args.getString("amount");

    const parsedAmount = Utils.evaluateNumber(await Utils.applyVariables(amount, variables, context));
    if (parsedAmount === null) return condition.missingArg("amount");

    return text.length > parsedAmount;
  }
}