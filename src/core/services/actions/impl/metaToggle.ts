import { Action, ActionArgumentsValidator, ActionData, Context, IsValidMetaKey, Variable, Utils } from '@itsmybot';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true})
  value: string | string[]

  @IsDefined()
  @IsString()
  @Validate(IsValidMetaKey)
  key: string
}

export default class MetaToggleAction extends Action {
  id = "metaToggle";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getString("key");
    const value = await Utils.applyVariables(script.args.getString("value"), variables, context);
    const parsedValue = Utils.evaluateBoolean(value)
    if (!parsedValue) return script.missingArg("value", context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key)!;

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, parsedValue.toString(), context.user.id);
        await userMeta.toggle(parsedValue);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, parsedValue.toString(), context.channel.id);
        await channelMeta.toggle(parsedValue);
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, parsedValue.toString(), context.message.id);
        await messageMeta.toggle(parsedValue);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, parsedValue.toString());
        await globalMeta.toggle(parsedValue);
        break;
    }
  }
}