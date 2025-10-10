import { MessageValidator } from '@itsmybot';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  sent: MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'unknown-message': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'unknown-preset': MessageValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  edited: MessageValidator
}
