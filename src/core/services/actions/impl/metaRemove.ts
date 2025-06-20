import { Action, ActionData, Context, Variable, MetaData } from '@itsmybot';

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
        const userMeta = await MetaData.findOne({ where: { key, mode, type, scopeId: context.user.id } });
        await userMeta?.destroy();
        break;
      case 'channel':
        if (!context.channel) return script.missingContext("channel", context);
        const channelMeta = await MetaData.findOne({ where: { key, mode, type, scopeId: context.channel.id } });
        await channelMeta?.destroy();
        break;
      case 'message':
        if (!context.message) return script.missingContext("message", context);
        const messageMeta = await MetaData.findOne({ where: { key, mode, type, scopeId: context.message.id } });
        await messageMeta?.destroy();
        break;
      case 'global': 
        const globalMeta = await MetaData.findOne({ where: { key, mode, type, scopeId: 'global' } });
        await globalMeta?.destroy();
        break;
    }
  }
}