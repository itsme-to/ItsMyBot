
import { Type } from 'class-transformer';
import { IsString, IsInt, ValidateNested, IsOptional, ValidateIf, IsDefined, Max, Min, IsPositive, IsArray, IsBoolean, IsNumber, Validate } from 'class-validator';
import { IsPermissionFlag, IsValidActionArgs, IsValidActionId, IsValidConditionArgs, IsValidConditionId, MessageValidator } from '@itsmybot';

export class ConditionArgumentValidator {
  @IsOptional()
  @IsBoolean()
  inverse: boolean
}

export class ConditionValidator {
  @ValidateIf(o => !o.expression)
  @IsDefined()
  @IsString()
  @Validate(IsValidConditionId)
  id: string

  @ValidateIf(o => !o.id)
  @IsDefined()
  @IsString()
  expression: string

  @IsOptional()
  @Validate(IsValidConditionArgs)
  args: ConditionArgumentValidator

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
  @IsString()
  key: string

  @IsOptional()
  @IsBoolean()
  inherit: boolean

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

  @IsOptional()
  @IsString()
  message: string
}

export class PermissionOverwrites {
  @IsDefined()
  @IsString()
  id: string
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Validate(IsPermissionFlag, { each: true })
  allow: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Validate(IsPermissionFlag, { each: true })
  deny: string[]
}

export class ActionArgumentsValidator extends MessageValidator{
  @IsOptional()
  @IsInt()
  @IsPositive()
  every: number

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
}

export class FollowUpActionArgumentsValidator extends ActionArgumentsValidator {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionValidator)
  actions: ActionValidator[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionValidator)
  'follow-up-actions': ActionValidator[]
}

export class ActionValidator {

  @IsOptional()
  @IsString()
  @Validate(IsValidActionId)
  id: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionValidator)
  actions: ActionValidator[]

  @IsOptional()
  @Validate(IsValidActionArgs)
  args: ActionArgumentsValidator

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