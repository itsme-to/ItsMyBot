import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsDefined } from 'class-validator';
import { MessageValidator, TopMessageComponentValidator, TypeTopMessageComponentValidator } from '@itsmybot';

class Meta {
  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'scope-required': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'set': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'add': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'subtract': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'switch': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'remove': MessageValidator
}

class Addon {
  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  list: MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  enabled: MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  disabled: MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'already-enabled': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'already-disabled': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'not-found': MessageValidator
}

class Pagination {
  @IsDefined()
  @IsString()
  'select-placeholder': string

  @IsDefined()
  @IsString()
  placeholder: string

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'no-data': MessageValidator

  @IsDefined()
  @ValidateNested({ each: true })
  @TypeTopMessageComponentValidator()
  components: TopMessageComponentValidator[]
}

class Leaderboard extends MessageValidator {
  @IsDefined()
  @IsString()
  'messages-format': string
}

class Engine {
  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'missing-argument': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'missing-context': MessageValidator
}

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'no-permission': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'in-cooldown': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'only-in-primary-guild': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => Pagination)
  pagination: Pagination

  @IsDefined()
  @ValidateNested()
  @Type(() => Addon)
  addon: Addon

  @IsDefined()
  @ValidateNested()
  @Type(() => Leaderboard)
  leaderboard: Leaderboard

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  parsed: MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  reloaded: MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'error-reloading': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => Engine)
  engine: Engine

  @IsDefined()
  @ValidateNested()
  @Type(() => Meta)
  meta: Meta
}
