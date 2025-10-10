import { CommandValidator } from '@itsmybot';
import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';

class Preset extends CommandValidator {
  @IsDefined()
  @IsString()
  'context-menu': string
}

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => Preset)
  preset: Preset
}
