import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true})
  value: string | string[]
}

export default class SetTagAction extends Action {
  id = "setTag";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    const tags = script.args.getStringsOrNull("value") || [];
    const parsedTag: string[] = [];

    await Promise.all(tags.map(async tag => {
      const resolvedTag = await Utils.applyVariables(tag, variables, context);
      parsedTag.push(resolvedTag);
    }));

    await context.channel.setAppliedTags(parsedTag, `Tags added by action: ${script.id}`);
  }
}