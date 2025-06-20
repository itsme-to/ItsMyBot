import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class TimeoutMemberAction extends Action {
  id = "timeoutMember";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const duration = script.args.getNumberOrNull("duration");
    let reason = script.args.getStringOrNull("value");

    reason = await Utils.applyVariables(reason, variables, context);

    if (!context.member) return script.missingContext("member", context);
    if (!duration) return script.missingArg("duration", context);

    await context.member.timeout(duration, reason);
  }
}