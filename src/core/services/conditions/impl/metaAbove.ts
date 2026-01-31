import { Condition, ConditionData, Context, Variable, ConditionArgumentValidator, IsValidMetaKey, IsNumberMeta, Utils, IsNumberOrString } from '@itsmybot';
import { IsDefined, IsString, Validate } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsString()
  @Validate(IsValidMetaKey)
  @Validate(IsNumberMeta)
  key: string;

  @IsDefined()
  @Validate(IsNumberOrString)
  value: string | number;
}

export default class MetaAboveCondition extends Condition {
  id = "metaAbove";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const key = condition.args.getString("key");
    let value = condition.args.getString("value");
    value = await Utils.applyVariables(value, variables, context);

    const meta = this.manager.services.engine.metaHandler.metas.get(key)!;

    const scopeId = this.manager.services.engine.metaHandler.resolveScopeId(context, meta.mode);
    if (!scopeId) {
      this.logger.error(`Could not resolve scope ID for meta ${key} in mode ${meta.mode}.`);
      return false;
    }

    const metaData = await this.manager.services.engine.metaHandler.findOrCreate(key, '[ ]', scopeId);

    try {
      const numberValue = parseFloat(metaData.value);
      return numberValue > parseFloat(value);
    } catch (error) {
      this.logger.error(`Failed to parse meta value for ${key}: ${error}`);
      return false;
    }
  }
}