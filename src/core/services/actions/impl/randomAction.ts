import { Action, ActionData, Context, Variable, Utils, ActionArgumentsValidator, ActionValidator } from '@itsmybot';

class ArgumentsValidator extends ActionArgumentsValidator {
  actions: ActionValidator[]
}

export default class RandomAction extends Action {
  id = "randomAction";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {

    const actions = this.manager.services.action.parseActions(script.args.getSubsections("actions"));

    const action = Utils.getRandom(actions);

    await action.run(context, variables); 
  }
}