import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsNumber } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsNumber()
  amount: number;
}

export default class SetCoinsAction extends Action {
  id = "setCoins";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const amount = script.args.getNumber("amount");

    if (!context.user) return script.missingContext("user", context);

    context.user.setCoins(amount);
  }
}