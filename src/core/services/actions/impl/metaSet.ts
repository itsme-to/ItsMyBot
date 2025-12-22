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

export default class MetaSetAction extends Action {
  id = "metaSet";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getString("key");
    const value = await Utils.applyVariables(script.args.getString("value", true), variables, context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key)!;

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, value, context.user.id);
        await userMeta.setValue(value);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, value, context.channel.id);
        await channelMeta.setValue(value);
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, value, context.message.id);
        await messageMeta.setValue(value);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, value, 'global');
        await globalMeta.setValue(value);
        break;
    }
  }
}