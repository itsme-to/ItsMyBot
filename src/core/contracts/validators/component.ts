import { Type } from 'class-transformer';
import { IsString, IsInt, IsIn, IsArray, IsBoolean, IsOptional, ValidateNested, IsDefined, ArrayMaxSize, IsNumber, Validate, MaxLength } from 'class-validator';
import { IsBooleanOrString, IsTextInputStyle } from '../decorators/validator.js';
import { ConditionValidator } from '@itsmybot';

class OptionsValidator {
  @IsOptional()
  @IsString()
  label: string

  @IsOptional()
  @IsString()
  value: string

  @IsOptional()
  @IsString()
  emoji: string

  @IsOptional()
  @IsBoolean()
  default: boolean

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]
}

class TextInputValidator {
  @IsDefined()
  @IsString()
  id: string

  @IsDefined()
  @IsString()
  @MaxLength(45)
  label: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  placeholder: string

  @IsOptional()
  @IsBoolean()
  required: boolean

  @IsOptional()
  @IsNumber()
  'max-lenght': number

  @IsOptional()
  @IsString()
  value: string

  @IsOptional()
  @IsString()
  @Validate(IsTextInputStyle)
  style: string
}

export class ModalValidator {
  @IsDefined()
  @IsString()
  title: string

  @IsDefined()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested()
  @Type(() => TextInputValidator)
  components: TextInputValidator[]
}

export class ButtonValidator {
  @IsOptional()
  @IsString()
  @IsString({ each: true })
  style: string | string[]

  @IsOptional()
  @IsString()
  @IsString({ each: true })
  'custom-id': string | string[]

  @IsOptional()
  @Validate(IsBooleanOrString)
  disabled: boolean | string

  @IsOptional()
  @IsString()
  @IsString({ each: true })
  label: string | string[]

  @IsOptional()
  @IsString()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  emoji: string | string[]

  @IsOptional()
  @IsString()
  @IsString({ each: true })
  url: string | string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]
}

export class ComponentValidator extends ButtonValidator {
  @IsOptional()
  @IsString()
  @IsIn(["button", "select-menu"])
  type: string

  @IsOptional()
  @IsString()
  placeholder: string

  @IsOptional()
  @IsInt()
  'min-values': number

  @IsOptional()
  @IsInt()
  'max-values': number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionsValidator)
  options: OptionsValidator[]
}