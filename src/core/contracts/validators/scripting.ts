
import { Type } from 'class-transformer';
import { IsString, IsInt, IsIn, ValidateNested, IsOptional, ValidateIf, IsDefined, Max, Min, IsPositive, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { MessageValidator } from '@itsmybot';

class ConditionArgumentValidator {
  @IsOptional()
  @IsBoolean()
  inverse: boolean

  @IsOptional()
  @IsString({ each: true })
  value: string[] | string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]

  @IsOptional()
  @IsBoolean()
  'ignore-case': boolean

  @IsOptional()
  @IsNumber()
  amount: number

  @IsOptional()
  @IsBoolean()
  inherit: boolean
}

export class ConditionValidator {
  @ValidateIf(o => !o.expression)
  @IsDefined()
  @IsString()
  id: string

  @ValidateIf(o => !o.id)
  @IsDefined()
  @IsString()
  expression: string

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionArgumentValidator)
  args: ConditionArgumentValidator

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionValidator)
  'not-met-actions': ActionValidator[]
}

export class MutatorValidator {
  @IsOptional()
  @IsString()
  content: string

  @IsOptional()
  @IsString()
  channel: string

  @IsOptional()
  @IsString()
  role: string

  @IsOptional()
  @IsString()
  guild: string

  @IsOptional()
  @IsString()
  member: string

  @IsOptional()
  @IsString()
  user: string
}

class ActionArgumentValidator extends MessageValidator {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionValidator)
  actions: ActionValidator[]

  @IsOptional()
  @IsString({ each: true })
  value: string | string[]

  @IsOptional()
  @IsInt()
  @IsPositive()
  every: number

  @IsOptional()
  @IsString()
  key: string

  @IsOptional()
  @IsString()
  @IsIn(['user', 'global', 'channel'])
  mode: 'user' | 'global' | 'channel'

  @IsOptional()
  @IsString()
  @IsIn(['string', 'number', 'boolean'])
  type: 'string' | 'number' | 'boolean'

  @IsOptional()
  @IsInt()
  @IsPositive()
  cooldown: number

  @IsOptional()
  @IsInt()
  @IsPositive()
  delay: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  chance: number

  @IsOptional()
  @IsInt()
  @IsPositive()
  duration: number

  @IsOptional()
  @IsString()
  method: string

  @IsOptional()
  body: any

  @IsOptional()
  headers: any
}

export class ActionValidator {
  @IsOptional()
  @IsString()
  id: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionValidator)
  actions: ActionValidator[]

  @IsOptional()
  @ValidateNested()
  @Type(() => ActionArgumentValidator)
  args: ActionArgumentValidator

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]

  @IsOptional()
  @ValidateNested()
  @Type(() => MutatorValidator)
  mutators: MutatorValidator
}

export class TriggerActionValidator extends ActionValidator {
  @IsDefined()
  @IsString({ each: true })
  triggers: string[] | string
}