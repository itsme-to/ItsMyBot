import { Condition, ConditionArgumentValidator, ConditionData, ConditionValidator, Context, Variable } from '@itsmybot';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsNumber, IsPositive, Min, ValidateNested } from 'class-validator';

class ArgumentsValidator extends ConditionArgumentValidator {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]

  @IsDefined()
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number
}

export default class AtLeastOfCondition extends Condition {
  id = "atLeastOf";
  argumentsValidator = ArgumentsValidator;

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const conditionsConfig = condition.args.getSubsections("conditions");
    const amount = condition.args.getNumber("amount");

    const conditions = this.manager.services.condition.parseConditions(conditionsConfig, false);

    const isMet = await Promise.all(conditions.map(condition => this.manager.services.condition.isConditionMet(condition, context, variables)))
    return isMet.filter(result => result).length >= amount;
  }
}