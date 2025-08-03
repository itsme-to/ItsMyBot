import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { AnyThreadChannel, ChannelType } from 'discord.js';

export default class StartThreadAction extends Action {
  id = "startThread";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    let thread: AnyThreadChannel;
    if (context.channel && context.channel.type === ChannelType.GuildForum) {
      const output = await this.createForumPost(script, context, variables);
      if (!output) return script.missingContext("channel", context);
      thread = output;
    } else {
      const output = await this.createThread(script, context, variables);
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

  async createForumPost(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || context.channel.type !== ChannelType.GuildForum) return

    return context.channel.threads.create({
      name: await Utils.applyVariables(script.args.getString("value"), variables, context) || "Thread",
      autoArchiveDuration: script.args.getNumberOrNull("duration") || 60,
      message: await Utils.setupMessage({ config: script.args, context, variables }) || undefined,
      appliedTags: await Promise.all(script.args.getStringsOrNull("tags")?.map(async tag => await Utils.applyVariables(tag, variables, context)) || [])
    });

  }

  async createThread(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.message) return

    return context.message.startThread({
      name: await Utils.applyVariables(script.args.getString("value"), variables, context) || "Thread",
      autoArchiveDuration: script.args.getNumberOrNull("duration") || 60
    });
  }
}