import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsDefined, IsArray, IsString, NotContains, IsIn, IsBoolean, Validate } from 'class-validator';
import { IsNumberAndUserMeta } from '@itsmybot';

class LeaderboardConfig {
  @IsDefined()
  @IsBoolean()
  enabled: boolean

  @IsDefined()
  @IsString()
  name: string

  @IsDefined()
  @IsString()
  description: string

  @IsOptional()
  @IsString()
  format: string
}

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

  @IsOptional()
  @Validate(IsNumberAndUserMeta)
  @ValidateNested()
  @Type(() => LeaderboardConfig)
  leaderboard?: LeaderboardConfig
}

export default class DefaultConfig {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Meta)
  metas: Meta[]
}
