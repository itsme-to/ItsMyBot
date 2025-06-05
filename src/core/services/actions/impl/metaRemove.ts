import { Action, ActionData, Context, Variable, Meta } from '@itsmybot';

export default class MetaRemoveAction extends Action {
  id = "metaRemove";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const key = script.args.getStringOrNull("key");
    const type = script.args.getStringOrNull("type");
    const mode = script.args.getStringOrNull("mode") || "user";

    if (!key) return script.missingArg("key", context);
    if (!type) return script.missingArg("type", context);

    switch (mode) {
      case 'user':
        if (!context.user) return script.missingContext("user", context);
        const userMeta = await Meta.findOne({ where: { key, mode, type, scopeId: context.user.id } });
        await userMeta?.destroy();
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await Meta.findOne({ where: { key, mode, type, scopeId: context.channel.id } });
        await channelMeta?.destroy();
        break;
      case 'global': 
        const globalMeta = await Meta.findOne({ where: { key, mode, type, scopeId: 'global' } });
        await globalMeta?.destroy();
        break;
    }
  }
}