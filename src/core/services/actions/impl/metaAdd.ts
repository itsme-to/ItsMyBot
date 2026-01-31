import { Action, ActionArgumentsValidator, ActionData, Context, IsNumberMeta, IsValidMetaKey, Variable, Utils, IsNumberOrString } from '@itsmybot';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @Validate(IsNumberOrString)
  value: string | number

  @IsDefined()
  @IsString()
  @Validate(IsValidMetaKey)
  @Validate(IsNumberMeta)
  key: string
}

export default class MetaAddAction extends Action {
  id = "metaAdd";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getString("key");
    const value = script.args.getString("value");

    const parsedValue = Utils.evaluateNumber(await Utils.applyVariables(value, variables, context))
    if (parsedValue === null) return script.missingArg("value", context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key)!;

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, context.user.id);
        await userMeta.add(parsedValue);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, context.channel.id);
        await channelMeta.add(parsedValue);
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, context.message.id);
        await messageMeta.add(parsedValue);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, meta.default, 'global');
        await globalMeta.add(parsedValue);
        break;
    }
  }
}