import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class MetaSubstrackAction extends Action {
  id = "metaSubtract";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getStringOrNull("key");
    let value = script.args.getStringOrNull("value");
    const mode = script.args.getStringOrNull("mode") || "user";

    value = await Utils.applyVariables(value, variables, context);
    const parsedValue = Utils.evaluateNumber(value)

    if (!parsedValue) return script.missingArg("value", context);
    if (!key) return script.missingArg("key", context);

    switch (mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, mode, 'number', '0', context.user.id);
        await userMeta.subtract(parsedValue);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, mode, 'number', '0', context.channel.id);
        await channelMeta.subtract(parsedValue);
        break;
      case 'global':
        const globalMeta = await this.manager.services.engine.metaHandler.findOrCreate(key, mode, 'number', '0');
        await globalMeta.subtract(parsedValue);
        break;
    }
  }
}