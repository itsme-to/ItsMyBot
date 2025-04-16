import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { Parser } from 'expr-eval';

export default class IsExpressionTrueCondition extends Condition {
  id = "isExpressionTrue";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const expressionArg = condition.args.getStringOrNull("value");
    if (!expressionArg) return condition.missingArg("value");

    const expression = await Utils.applyVariables(expressionArg, variables, context);
    if (!expression) return condition.logError("Invalid expression");
    try {
      const parsedExpression = Parser.parse(expression);
      const result = parsedExpression.evaluate();

      if (typeof result !== 'boolean' && result !== 0 && result !== 1) {
        return condition.logError("Expression did not evaluate to a boolean");
      }

      return result;
    } catch (error) {
      return condition.logError("Error evaluating expression: " + error);
    }
  }
}