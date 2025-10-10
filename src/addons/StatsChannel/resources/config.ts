import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Channel {
  @IsDefined()
  @IsString()
  id: string

  @IsDefined()
  @IsString()
  name: string
}

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => Channel)
  channels: Channel[]
}
