import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class MetaIncludesCondition extends Condition {
  id = "metaIncludes";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const arg = condition.args.getStringOrNull("key")
    if (!arg) return condition.missingArg("key");

    let value = condition.args.getStringOrNull("value");
    value = await Utils.applyVariables(value, variables, context);
    if (!value) return condition.missingArg("value");

    const meta = this.manager.services.engine.metaHandler.metas.get(arg);
    if (!meta) {
      this.logger.error(`Meta with key ${arg} is not registered.`);
      return false;
    }

    if (meta.type !== 'list') {
      this.logger.error(`Meta with key ${arg} is not a list type.`);
      return false;
    }

    const scopeId = this.manager.services.engine.metaHandler.resolveScopeId(context, meta.mode);
    if (!scopeId) {
      this.logger.error(`Could not resolve scope ID for meta ${arg} in mode ${meta.mode}.`);
      return false;
    }

    const metaData = await this.manager.services.engine.metaHandler.findOrCreate(arg, '[ ]', scopeId);
    
    try {
      const list: string[] = JSON.parse(metaData.value);
      return list.includes(value);
    } catch (error) {
      this.logger.error(`Failed to parse meta value for ${arg}: ${error}`);
      return false;
    }
  }
}