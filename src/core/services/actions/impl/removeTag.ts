import { Action, ActionArgumentsValidator, ActionData, Context, Variable, Utils } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true})
  value: string | string[]
}

export default class RemoveTagAction extends Action {
  id = "removeTag";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.channel || !context.channel.isThread()) return script.missingContext("channel", context);
    const tags = script.args.getStrings("value")

    const parsedTag = context.channel.appliedTags;
    await Promise.all(tags.map(async tag => {
      const resolvedTag = await Utils.applyVariables(tag, variables, context);
      if (parsedTag.includes(resolvedTag)) {
        parsedTag.splice(parsedTag.indexOf(resolvedTag), 1);
      }
    }));

    await context.channel.setAppliedTags(parsedTag, `Tags removed by action: ${script.id}`);
  }
}