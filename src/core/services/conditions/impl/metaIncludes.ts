import { Condition, ConditionArgumentValidator, ConditionData, Context, IsListMeta, IsValidMetaKey, Variable, Utils } from '@itsmybot';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  @Validate(IsValidMetaKey)
  @Validate(IsListMeta)
  key: string;

  @IsDefined()
  @IsString()
  value: string;
}

export default class MetaIncludesCondition extends Condition {
  id = "metaIncludes";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const key = condition.args.getString("key");
    let value = condition.args.getString("value");
    value = await Utils.applyVariables(value, variables, context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key)!;

    if (meta.type !== 'list') {
      this.logger.error(`Meta with key ${key} is not a list type.`);
      return false;
    }

    const scopeId = this.manager.services.engine.metaHandler.resolveScopeId(context, meta.mode);
    if (!scopeId) {
      this.logger.error(`Could not resolve scope ID for meta ${key} in mode ${meta.mode}.`);
      return false;
    }

    const metaData = await this.manager.services.engine.metaHandler.findOrCreate(key, '[ ]', scopeId);

    try {
      const list: string[] = JSON.parse(metaData.value);
      return list.includes(value);
    } catch (error) {
      this.logger.error(`Failed to parse meta value for ${key}: ${error}`);
      return false;
    }
  }
}