import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { GuildChannel } from 'discord.js';

export default class InChannelCondition extends Condition {
  id = "inChannel";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.config.getStringsOrNull("value")
    if (!arg) return condition.missingArg("value");
    if (!context.channel) return condition.missingContext("channel");
    if (!(context.channel instanceof GuildChannel)) return false;

    for (const channel of arg) {
      const dChannel = await Utils.findChannel(channel, context.guild);
      if (!dChannel) {
        this.logger.warn(`Channel ${channel} not found in guild ${context.guild?.name}`);
        continue;
      }

      if (context.channel.id === dChannel.id || context.channel.parent?.id === dChannel.id ) return true;
    }

    return false;
  }
}