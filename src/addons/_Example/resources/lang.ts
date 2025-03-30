import { MessageValidator } from '@contracts';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => MessageValidator)
  'hello-world': MessageValidator
}
