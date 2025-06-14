import { Type } from 'class-transformer';
import { ValidateNested, IsDefined } from 'class-validator';
import { CommandValidator } from '@itsmybot';

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => CommandValidator)
  addons: CommandValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => CommandValidator)
  parse: CommandValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => CommandValidator)
  reload: CommandValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => CommandValidator)
  leaderboard: CommandValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => CommandValidator)
  meta: CommandValidator
}