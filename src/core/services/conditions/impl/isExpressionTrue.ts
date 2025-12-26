import { Condition, ConditionData, Context, Variable, ConditionArgumentValidator, Utils } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  value: string
}

export default class IsExpressionTrueCondition extends Condition {
  id = "isExpressionTrue";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const expressionArg = condition.args.getString("value");

    const expression = await Utils.applyVariables(expressionArg, variables, context);
    if (!expression) return condition.logError("Invalid expression");

    try {
      const result = Utils.evaluateBoolean(expression);
      if (result === null) return condition.logError("Expression did not evaluate to a boolean");
      return result;
    } catch (error) {
      return false
    }
  }
}