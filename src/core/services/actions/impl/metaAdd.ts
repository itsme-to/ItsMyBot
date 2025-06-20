import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class MetaAddAction extends Action {
  id = "metaAdd";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getStringOrNull("key");
    let value = script.args.getStringOrNull("value");

    value = await Utils.applyVariables(value, variables, context);
    const parsedValue = Utils.evaluateNumber(value)

    if (!parsedValue) return script.missingArg("value", context);
    if (!key) return script.missingArg("key", context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key);
    if (!meta) return script.logError(`Meta with key ${key} is not registered.`);

    switch (meta.mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '0', context.user.id);
        await userMeta.add(parsedValue);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '0', context.channel.id);
        await channelMeta.add(parsedValue);
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '0', context.message.id);
        await messageMeta.add(parsedValue);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, '0');
        await globalMeta.add(parsedValue);
        break;
    }
  }
}