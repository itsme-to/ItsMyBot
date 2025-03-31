import { IsString, IsInt, IsArray, IsBoolean, IsOptional, IsDefined, NotEquals, Validate, ValidateNested } from 'class-validator';
import { ConditionValidator, IsPermissionFlag } from '@itsmybot';
import { Type } from 'class-transformer';

export class CommandValidator {
  @IsOptional()
  @IsBoolean()
  enabled: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases: string[]

  @IsOptional()
  @IsInt()
  @NotEquals(0)
  cooldown: number

  @IsOptional()
  @IsString()
  @Validate(IsPermissionFlag)
  permission: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]

  @IsDefined()
  @IsString()
  description: string

  @IsOptional()
  subcommands: unknown

  @IsOptional()
  options: unknown
}
