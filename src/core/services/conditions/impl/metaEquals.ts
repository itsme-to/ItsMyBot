import { Condition, ConditionArgumentValidator, ConditionData, Context, IsNotListMeta, IsValidMetaKey, Variable, Utils } from '@itsmybot';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  @Validate(IsValidMetaKey)
  @Validate(IsNotListMeta)
  key: string;

  @IsDefined()
  @IsString()
  value: string;
}

export default class BelowMetaCondition extends Condition {
  id = "metaEquals";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const key = condition.args.getString("key")
    let value = condition.args.getString("value");
    value = await Utils.applyVariables(value, variables, context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key)!;

    if (meta.type !== 'string' && meta.type !== 'number' && meta.type !== 'boolean') {
      this.logger.error(`Meta with key ${key} is not a valid type.`);
      return false;
    }

    const scopeId = this.manager.services.engine.metaHandler.resolveScopeId(context, meta.mode);
    if (!scopeId) {
      this.logger.error(`Could not resolve scope ID for meta ${key} in mode ${meta.mode}.`);
      return false;
    }

    const metaData = await this.manager.services.engine.metaHandler.findOrCreate(key, '[ ]', scopeId);

    try {
      const metaValue = JSON.parse(metaData.value);
      return metaValue === value
    } catch (error) {
      this.logger.error(`Failed to parse meta value for ${key}: ${error}`);
      return false;
    }
  }
}