import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageValidator } from '@itsmybot';

export default class DefaultConfig {

  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  message: MessageValidator
}
