import { Action, ActionData, Context, IsChannelType, Utils, ActionArgumentsValidator, PermissionOverwrites, Variable } from '@itsmybot';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { ChannelType, OverwriteResolvable } from 'discord.js';


class ArgumentsValidator extends ActionArgumentsValidator {
  @IsOptional()
  @IsString({ each: true})
  value: string | string[]

  @IsOptional()
  @IsString({ each: true })
  description?: string | string[];

  @IsOptional()
  @IsArray()
  @Type(() => PermissionOverwrites)
  @ValidateNested({ each: true })
  'permission-overwrites': PermissionOverwrites[]

  @IsOptional()
  @IsString()
  @Validate(IsChannelType)
  'channel-type': string

  @IsOptional()
  @IsString()
  parent: string
}

export default class EditChannelAction extends Action {
  id = "editChannel";
  argumentsValidator = ArgumentsValidator;

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