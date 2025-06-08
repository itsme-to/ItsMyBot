import { Type } from 'class-transformer';
import { IsString, IsArray, IsBoolean, IsOptional, ValidateNested, IsDefined, ArrayMaxSize, IsNumber, Validate, MaxLength } from 'class-validator';
import { IsTextInputStyle } from '../decorators/validator.js';


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