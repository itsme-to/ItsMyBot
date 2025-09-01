import { Action, ActionData, Context, FollowUpActionArgumentsValidator, Variable } from '@itsmybot';
import Utils from '@utils';

export default class RandomAction extends Action {
  id = "randomAction";
  argumentsValidator = FollowUpActionArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    script.followUpActions = [Utils.getRandom(script.followUpActions)]
    this.triggerFollowUpActions(script, context, variables);
  }
}