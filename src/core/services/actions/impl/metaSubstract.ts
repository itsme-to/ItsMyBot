import { Action, ActionArgumentsValidator, ActionData, Context, IsNumberMeta, IsValidMetaKey, Variable, Utils } from '@itsmybot';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true})
  value: string | string[]

  @IsDefined()
  @IsString()
  @Validate(IsValidMetaKey)
  @Validate(IsNumberMeta)
  key: string
}

export default class MetaSubtractAction extends Action {
  id = "metaSubtract";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getString("key");
    const value = await Utils.applyVariables(script.args.getString("value", true), variables, context);
    const parsedValue = Utils.evaluateNumber(value);
    if (!parsedValue) return script.missingArg("value", context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key)!;

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, context.user.id);
        await userMeta.subtract(parsedValue);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, context.channel.id);
        await channelMeta.subtract(parsedValue);
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, context.message.id);
        await messageMeta.subtract(parsedValue);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, 'global');
        await globalMeta.add(parsedValue);
        break;
    }
  }
}