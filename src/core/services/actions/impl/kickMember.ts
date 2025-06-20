import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class KickMemberAction extends Action {
  id = "kickMember";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    let reason = script.args.getStringOrNull("value");
    reason = await Utils.applyVariables(reason, variables, context);

    if (!context.member) return script.missingContext("member", context);

    if (context.member.kickable) {
      await context.member.kick(reason);
    }
  }
}