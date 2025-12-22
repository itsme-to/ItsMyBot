import { Condition, ConditionArgumentValidator, ConditionData, ConditionValidator, Context, Variable } from '@itsmybot';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]
}

export default class AnyOfCondition extends Condition {
  id = "anyOf";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const conditionsConfig = condition.args.getSubsections("conditions");
    const conditions = this.manager.services.condition.parseConditions(conditionsConfig, false);

    const isMet = await Promise.all(conditions.map(condition => this.manager.services.condition.isConditionMet(condition, context, variables)))
    return isMet.some(result => result);
  }
}