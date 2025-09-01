import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true})
  value: string | string[]

  @IsDefined()
  @IsString()
  key: string
}

export default class MetaListRemoveAction extends Action {
  id = "metaListRemove";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getString("key");
    let value = script.args.getString("value", true);

    value = await Utils.applyVariables(value, variables, context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key);
    if (!meta) return script.logError(`Meta with key ${key} is not registered.`);

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]', context.user.id);
        await userMeta.listRemove(value);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]', context.channel.id);
        await channelMeta.listRemove(value);
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]', context.message.id);
        await messageMeta.listRemove(value);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]');
        await globalMeta.listRemove(value);
        break;
    }
  }
}