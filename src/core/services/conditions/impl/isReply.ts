import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import { MessageType } from 'discord.js';

export default class isReplyCondition extends Condition {
  id = "isReply";

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    if (!context.message) return condition.missingContext("message");

    return context.message.type === MessageType.Reply;
  }
}