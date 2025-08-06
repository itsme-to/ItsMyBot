import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { AnyThreadChannel, ChannelType } from 'discord.js';

export default class CreateThreadAction extends Action {
  id = "createThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    let thread: AnyThreadChannel | undefined;

    const channel = context.channel;
    if (!channel) return script.missingContext("channel", context);
    let message = context.message;

    const name = (await Utils.applyVariables(script.args.getStringOrNull("value"), variables, context)) || "Thread";
    const autoArchiveDuration = script.args.getNumberOrNull("duration") || 60;

    if (channel.type === ChannelType.GuildForum) {
      const messageConfig = (await Utils.setupMessage({ config: script.args, context, variables })) || undefined;
      const appliedTags = script.args.has("tags")
        ? await Promise.all(script.args.getStrings("tags").map((tag) => Utils.applyVariables(tag, variables, context)))
        : undefined;

      thread = await channel.threads.create({ name, autoArchiveDuration, message: messageConfig, appliedTags });
      message = await thread.fetchStarterMessage() || message;
    }
    if (channel.type === ChannelType.GuildAnnouncement) {
      thread = await channel.threads.create({ name, autoArchiveDuration });
    }

    if (channel.type === ChannelType.GuildText) {
      const threadType =
        script.args.getBoolOrNull("private") === true
          ? ChannelType.PrivateThread
          : ChannelType.PublicThread;

      thread = await channel.threads.create({ name, autoArchiveDuration, type: threadType });
    }

    if (!thread) return script.missingContext("channel", context);

    const newContext: Context = {
      ...context,
      message: message,
      content: thread.name,
      channel: thread
    };

    this.triggerActions(script, newContext, variables);
  }
}