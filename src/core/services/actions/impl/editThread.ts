import { Action, ActionData, Context, Variable, ActionArgumentsValidator } from '@itsmybot';
import Utils from '@utils';
import { IsArray, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsOptional()
  @IsString({ each: true})
  value: string | string[]

  @IsOptional()
  @IsInt()
  @IsPositive()
  duration: number
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  'tags': string[]
}

export default class EditThreadAction extends Action {
  id = "editThread";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {

    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);

    return context.channel.edit({
      name: await Utils.applyVariables(script.args.getStringOrNull("value", true), variables, context),
      autoArchiveDuration: script.args.getNumberOrNull("duration"),
      appliedTags: script.args.has("tags") ? await Promise.all(script.args.getStrings("tags").map(async tag => await Utils.applyVariables(tag, variables, context))) : undefined
    });
  }
}