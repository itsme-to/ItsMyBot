import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class ExpressionCondition extends Condition {
  id = "expression";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const input = condition.args.getStringOrNull("input")
    const operator = condition.args.getStringOrNull("operator")
    const output = condition.args.getStringOrNull("output")

    if (!input) return condition.missingArg("input");
    if (!operator) return condition.missingArg("operator");
    if (!output) return condition.missingArg("output");

    const inputNumber = parseFloat(await Utils.applyVariables(input, variables, context));
    const outputNumber = parseFloat(await Utils.applyVariables(output, variables, context));
 
    if (isNaN(inputNumber)) return condition.logError("Invalid number in input");
    if (isNaN(outputNumber)) return condition.logError("Invalid number in output");

    switch (operator) {
      case "==":
        return inputNumber === outputNumber;
      case "!=":
        return inputNumber !== outputNumber;
      case ">":
        return inputNumber > outputNumber;
      case "<":
        return inputNumber < outputNumber;
      case ">=":
        return inputNumber >= outputNumber;
      case "<=":
        return inputNumber <= outputNumber;
      default:
        return condition.logError("Invalid argument: operator expected one of ==, !=, >, <, >=, <=");
    }
  }
}