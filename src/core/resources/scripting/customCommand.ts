import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsOptional, IsDefined, IsArray, IsBoolean, IsNumber, Validate } from 'class-validator';
import { CommandValidator, ActionValidator, IsChannelType, IsCommandOptionType } from '@itsmybot';

class ChoiceOptionValidator {
  @IsDefined()
  @IsString()
  name: string

  @IsDefined()
  @IsString()
  value: string
}

class CommandOptionValidator {
  @IsDefined()
  @IsString()
  name: string

  @IsDefined()
  @IsString()
  description: string

  @IsDefined()
  @IsString()
  @Validate(IsCommandOptionType)
  type: string

  @IsOptional()
  @IsBoolean()
  required: boolean

  @IsOptional()
  @IsNumber()
  'max-length': number

  @IsOptional()
  @IsNumber()
  'min-length': number

  @IsOptional()
  @IsNumber()
  'min-value': number

  @IsOptional()
  @IsNumber()
  'max-value': number

  @IsOptional()
  @IsString()
  @Validate(IsChannelType)
  'channel-type': string

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ChoiceOptionValidator)
  choices: ChoiceOptionValidator[]
}

export default class DefaultConfig extends CommandValidator {
  @IsDefined()
  @IsString()
  name: string

  @IsDefined()
  @IsString()
  description: string

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CommandOptionValidator)
  options: CommandOptionValidator[]

  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => ActionValidator)
  actions: ActionValidator
}
