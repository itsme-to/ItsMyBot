import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsDefined, IsArray, IsString, NotContains, IsIn } from 'class-validator';

class Meta {
  @IsDefined()
  @IsString()
  @NotContains('_')
  key: string

  @IsDefined()
  @IsString()
  @IsIn(['string', 'number', 'boolean', 'list'])
  type: 'string' | 'number' | 'boolean' | 'list'

  @IsOptional()
  @IsString()
  default: string

  @IsOptional()
  @IsString()
  @IsIn(['global', 'user', 'channel', 'message'])
  mode: 'global' | 'user' | 'channel' | 'message'
}

export default class DefaultConfig {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Meta)
  metas: Meta[]
}
