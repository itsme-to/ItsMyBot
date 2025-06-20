import { Condition, ConditionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';

export default class MetaAboveCondition extends Condition {
  id = "metaAbove";

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

    if (meta.type !== 'number') {
      this.logger.error(`Meta with key ${arg} is not a number type.`);
      return false;
    }

    const scopeId = this.manager.services.engine.metaHandler.resolveScopeId(context, meta.mode);
    if (!scopeId) {
      this.logger.error(`Could not resolve scope ID for meta ${arg} in mode ${meta.mode}.`);
      return false;
    }

    const metaData = await this.manager.services.engine.metaHandler.findOrCreate(arg, '[ ]', scopeId);
    
    try {
      const numberValue = parseFloat(metaData.value);
      return numberValue > parseFloat(value);
    } catch (error) {
      this.logger.error(`Failed to parse meta value for ${arg}: ${error}`);
      return false;
    }
  }
}