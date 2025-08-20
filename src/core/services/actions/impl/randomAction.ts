import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class RandomAction extends Action {
  id = "randomAction";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    script.followUpActions = [Utils.getRandom(script.followUpActions)]
    this.triggerFollowUpActions(script, context, variables);
  }
}