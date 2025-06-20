import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class RemoveCoinsAction extends Action {
  id = "removeCoins";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const amount = script.args.getNumberOrNull("amount");

    if (!context.user) return script.missingContext("user", context);
    if (!amount) return script.missingArg("amount", context);

    context.user.removeCoins(amount);
  }
}