import { IsDefined, IsString } from 'class-validator';

export default class DefaultConfig {
  @IsDefined()
  @IsString()
  name: string;
}