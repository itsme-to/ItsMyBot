import { IsDefined, IsString } from 'class-validator';


export default class DefaultConfig {
  @IsDefined()
  @IsString()
  unknown: string

  @IsDefined()
  @IsString()
  offline: string

  @IsDefined()
  @IsString()
  online: string

  @IsDefined()
  @IsString()
  'no-motd': string
}