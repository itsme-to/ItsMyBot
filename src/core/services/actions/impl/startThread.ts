import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { AnyThreadChannel, ChannelType } from 'discord.js';

export default class StartThreadAction extends Action {
  id = "startThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    let thread: AnyThreadChannel;

    if (context.channel && context.channel.type === ChannelType.GuildForum) {
      const output = await this.createThread(script, context, variables);
      if (!output) return script.missingContext("channel", context);
      thread = output;
    } else if (context.message) {
      const output = await this.createThreadFromMessage(script, context, variables);
      if (!output) return script.missingContext("message", context);
      thread = output;
    } else {
      const output = await this.createThreadFromMessage(script, context, variables);
      if (!output) return script.missingContext("message", context);
      thread = output;
    }

    const newContext: Context = {
      ...context,
      message: await thread.fetchStarterMessage() || context.message,
      content: thread.name,
      channel: thread
    };

    this.triggerActions(script, newContext, variables);
  }

  async createThread(script: ActionData, context: Context, variables: Variable[]): Promise<AnyThreadChannel | void> {
    const channel = context.channel;

    if (!channel) return;
    const name = (await Utils.applyVariables(script.args.getString("value"), variables, context)) || "Thread";
    const autoArchiveDuration = script.args.getNumberOrNull("duration") || 60;

    if (channel.type === ChannelType.GuildForum) {
      const message = (await Utils.setupMessage({ config: script.args, context, variables })) || undefined;
      const appliedTags = script.args.has("tags")
        ? await Promise.all(script.args.getStrings("tags").map((tag) => Utils.applyVariables(tag, variables, context)))
        : undefined;

      return channel.threads.create({ name, autoArchiveDuration, message, appliedTags });
    }
    if (channel.type === ChannelType.GuildAnnouncement) {
      return channel.threads.create({ name, autoArchiveDuration });
    }

    if (channel.type === ChannelType.GuildText) {
      const threadType =
        script.args.getBoolOrNull("private") === true
          ? ChannelType.PrivateThread
          : ChannelType.PublicThread;

      return channel.threads.create({ name, autoArchiveDuration, type: threadType });
    }
    return;
  }

  async createThreadFromMessage(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return

    return context.message.startThread({
      name: await Utils.applyVariables(script.args.getString("value"), variables, context) || "Thread",
      autoArchiveDuration: script.args.getNumberOrNull("duration") || 60
    });
  }
}