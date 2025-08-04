import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { ChannelType, GuildChannelTypes, OverwriteResolvable } from 'discord.js';

export default class CreateChannelAction extends Action {
  id = "createChannel";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const channelName = await Utils.applyVariables(script.args.getStringOrNull("value", true), variables, context);
    const description = await Utils.applyVariables(script.args.getStringOrNull("description", true), variables, context) || undefined;
    const permissionOverwrites = script.args.has("permission-overwrites") ? await Promise.all(script.args.getSubsections("permission-overwrites").map(async overwrite => {
      return {
        id: await Utils.applyVariables(overwrite.getString("id"), variables, context),
        allow: overwrite.getStringsOrNull("allow"),
        deny: overwrite.getStringsOrNull("deny")
      } as OverwriteResolvable;
    })) : undefined;

    const type = script.args.getStringOrNull("channel-type");
    let channelType: GuildChannelTypes;
    if (type) {
      channelType = Utils.getChannelType(type) as GuildChannelTypes || ChannelType.GuildText;
    } else {
      channelType = ChannelType.GuildText;
    }

    if (!channelName) return script.missingArg("value", context);
    if (!context.guild) return script.missingContext("guild", context);

    const channel = await context.guild.channels.create({
      name: channelName,
      type: channelType,
      parent: script.args.getStringOrNull("parent"),
      reason: `Channel created by action: ${script.id}`,
      topic: description,
      permissionOverwrites: permissionOverwrites,
    });

    const newContext: Context = {
      ...context,
      channel: channel,
      content: channel.name,
    };

    this.triggerActions(script, newContext, variables)
  }
}