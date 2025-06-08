import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class MetaSetAction extends Action {
  id = "metaSet";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getStringOrNull("key");
    let value = script.args.getStringOrNull("value");
    const type = script.args.getStringOrNull("type");
    const mode = script.args.getStringOrNull("mode") || "user";

    value = await Utils.applyVariables(script.args.getStringOrNull("value"), variables, context);

    if (!value) return script.missingArg("value", context);
    if (!key) return script.missingArg("key", context);
    if (!type) return script.missingArg("type", context);

    switch (mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        await this.manager.services.engine.metaHandler.createOrUpdate(key, mode, type, value, context.user.id);
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        await this.manager.services.engine.metaHandler.createOrUpdate(key, mode, type, value, context.channel.id);
        break;
      case 'global':
        await this.manager.services.engine.metaHandler.createOrUpdate(key, mode, type, value);
        break;
    }
  }
}