import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class RandomAction extends Action {
  id = "randomAction";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    script.triggerActions = [Utils.getRandom(script.triggerActions)]
    this.triggerActions(script, context, variables);
  }
}