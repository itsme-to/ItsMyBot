import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class IsExpressionTrueCondition extends Condition {
  id = "isExpressionTrue";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const expressionArg = condition.config.getStringOrNull("value");
    if (!expressionArg) return condition.missingArg("value");

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