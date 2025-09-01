import { Action, ActionArgumentsValidator, ActionData, Context, Variable } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString()
  key: string
}

export default class MetaRemoveAction extends Action {
  id = "metaRemove";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getString("key");

    const meta = this.manager.services.engine.metaHandler.metas.get(key);
    if (!meta) return script.logError(`Meta with key ${key} is not registered.`);

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrNull(key, context.user.id);
        await userMeta?.destroy();
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrNull(key, context.channel.id);
        await channelMeta?.destroy();
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrNull(key, context.message.id);
        await messageMeta?.destroy();
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrNull(key);
        await globalMeta?.destroy();
        break;
    }
  }
}