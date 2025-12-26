import { Action, ActionArgumentsValidator, ActionData, Context, IsNumberOrString, Utils, Variable } from '@itsmybot';
import { IsDefined, Validate } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @Validate(IsNumberOrString)
  amount: number | string;
}

export default class SetCoinsAction extends Action {
  id = "setCoins";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const amount = script.args.getString("amount");

    const evaluatedAmount = Utils.evaluateNumber(await Utils.applyVariables(amount, variables, context))
    if (evaluatedAmount === null) return script.missingArg("amount", context);

    if (!context.user) return script.missingContext("user", context);

    context.user.setCoins(evaluatedAmount);
  }
}