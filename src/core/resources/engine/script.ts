import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsDefined, IsArray } from 'class-validator';
import { TriggerActionValidator, ConditionValidator } from '@itsmybot';

export default class DefaultConfig {
  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => TriggerActionValidator)
  actions: TriggerActionValidator

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]
}
