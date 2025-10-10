import { MessageValidator } from '@itsmybot';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'channel-created': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'channel-renamed': MessageValidator
}
