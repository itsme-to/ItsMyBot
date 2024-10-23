import { Type } from 'class-transformer';
import { ValidateNested, IsDefined } from 'class-validator';
import { CommandValidator } from '@contracts';

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => CommandValidator)
  plugin: CommandValidator

  @IsDefined()
  @ValidateNested()
  @Type(() => CommandValidator)
  'server-info': CommandValidator

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
}