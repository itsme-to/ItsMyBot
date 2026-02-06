
import { Type } from 'class-transformer';
import { IsString, IsInt, ValidateNested, IsOptional, ValidateIf, IsDefined, Max, Min, IsPositive, IsArray, IsBoolean, IsNumber, Validate } from 'class-validator';
import { IsPermissionFlag, IsValidActionArgs, IsValidActionId, IsValidConditionArgs, IsValidConditionId, MessageValidator, ModalValidator } from '@itsmybot';

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

export class TargetValidator {
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

class Bare {}
class MessageBase extends MessageValidator {}
class ModalBase extends ModalValidator {
  @IsDefined()
  @IsString()
  customId: string;
}

export class ActionArgumentsValidator extends applyActionArgumentFields(Bare) {}

export class ActionArgumentsValidatorWithMessage extends applyActionArgumentFields(MessageBase) {}

export class ActionArgumentsValidatorWithModal extends applyActionArgumentFields(ModalBase) {}

export class FollowUpActionArgumentsValidator extends applyFollowUpFields(ActionArgumentsValidator) {}

export class FollowUpActionArgumentsValidatorWithMessage extends applyFollowUpFields(ActionArgumentsValidatorWithMessage) {}

export class FollowUpActionArgumentsValidatorWithModal extends applyFollowUpFields(ActionArgumentsValidatorWithModal) {}

function applyActionArgumentFields<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  class Extended extends Base {
    @IsOptional()
    @IsInt()
    @IsPositive()
    every: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    cooldown: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    delay: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    chance: number;
  };

  return Extended;
}

function applyFollowUpFields<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  class Extended extends Base {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActionValidator)
    actions: ActionValidator[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActionValidator)
    'follow-up-actions': ActionValidator[];
  };

  return Extended;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => TargetValidator)
  target: TargetValidator
}

export class TriggerActionValidator extends ActionValidator {
  @IsDefined()
  @IsString({ each: true })
  triggers: string[] | string
}