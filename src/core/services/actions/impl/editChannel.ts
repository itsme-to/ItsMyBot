import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { ChannelType, OverwriteResolvable } from 'discord.js';

export default class EditChannelAction extends Action {
  id = "editChannel";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const channelName = await Utils.applyVariables(script.args.getStringOrNull("value", true), variables, context) || undefined
    const parent = script.args.getStringOrNull("parent");
    const description = await Utils.applyVariables(script.args.getStringOrNull("description", true), variables, context) || undefined;
    const permissionOverwrites = script.args.has("permission-overwrites") ? await Promise.all(script.args.getSubsections("permission-overwrites").map(async overwrite => {
      return {
        id: await Utils.applyVariables(overwrite.getString("id"), variables, context),
        allow: overwrite.getStringsOrNull("allow"),
        deny: overwrite.getStringsOrNull("deny")
      } as OverwriteResolvable;
    })) : undefined;

    if (!context.channel) return script.missingContext("channel", context);
    if (context.channel.type === ChannelType.DM || context.channel.type === ChannelType.GroupDM) {
      return script.logError("Cannot create a channel in a DM context.");
    }

    await context.channel.edit({
      name: channelName,
      parent: parent,
      reason: `Channel edited by action: ${script.id}`,
      topic: description,
      permissionOverwrites: permissionOverwrites
    });
  }
}