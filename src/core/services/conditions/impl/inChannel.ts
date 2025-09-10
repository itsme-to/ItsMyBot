import { Condition, ConditionData, Context, Variable, ConditionArgumentValidator, Utils } from '@itsmybot';
import { GuildChannel } from 'discord.js';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString({ each: true })
  value: string | string[]
}

export default class InChannelCondition extends Condition {
  id = "inChannel";
  argumentsValidator = ArgumentsValidator;

  isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getStrings("value");
    if (!context.channel) return condition.missingContext("channel");
    if (!(context.channel instanceof GuildChannel)) return false;

    for (const channel of arg) {
      const dChannel = Utils.findChannel(channel, context.guild);
      if (!dChannel) {
        this.logger.warn(`Channel ${channel} not found in guild ${context.guild?.name}`);
        continue;
      }

      if (context.channel.id === dChannel.id || context.channel.parent?.id === dChannel.id ) return true;
    }

    return false;
  }
}