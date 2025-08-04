import { Action, ActionData, Context, Variable } from '@itsmybot';

export default class DeleteChannelAction extends Action {
  id = "deleteChannel";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel) return script.missingContext("channel", context);
    await context.channel.delete(`Channel deleted by action: ${script.id}`);
  }
}