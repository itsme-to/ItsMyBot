import { Action, PermissionOverwrites, ActionData, Utils, Context, Variable, IsChannelType, FollowUpActionArgumentsValidator } from '@itsmybot';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { ChannelType, GuildChannelTypes, OverwriteResolvable } from 'discord.js';

class ArgumentsValidator extends FollowUpActionArgumentsValidator {
  @IsDefined()
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

export default class CreateChannelAction extends Action {
  id = "createChannel";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const channelName = await Utils.applyVariables(script.args.getString("value", true), variables, context);
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

    this.triggerFollowUpActions(script, newContext, variables)
  }
}