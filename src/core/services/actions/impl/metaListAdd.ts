import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class MetaListAddAction extends Action {
  id = "metaListAdd";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getStringOrNull("key");
    let value = script.args.getStringOrNull("value");

    value = await Utils.applyVariables(value, variables, context);

    if (!value) return script.missingArg("value", context);
    if (!key) return script.missingArg("key", context);

  
    const meta = this.manager.services.engine.metaHandler.metas.get(key);
    if (!meta) return script.logError(`Meta with key ${key} is not registered.`);

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]', context.user.id);
        await userMeta.listAdd(value);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]', context.channel.id);
        await channelMeta.listAdd(value);
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]', context.message.id);
        await messageMeta.listAdd(value);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '[]');
        await globalMeta.listAdd(value);
        break;
    }
  }
}