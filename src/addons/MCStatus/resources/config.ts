import { IsDefined, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ServerConfig {
  @IsDefined()
  @IsString()
  id: string

  @IsDefined()
  @IsString()
  address: string

  @IsDefined()
  @IsNumber()
  @IsPositive()
  port: number
}

export default class DefaultConfig {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => ServerConfig)
  servers: ServerConfig[]
}