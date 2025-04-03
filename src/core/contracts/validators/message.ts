import { Type } from 'class-transformer';
import { IsString, IsArray, IsBoolean, IsOptional, IsDefined, ValidateNested } from 'class-validator';
import { ComponentValidator, ConditionValidator } from '@itsmybot';

class MessageComponentValidator {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ComponentValidator)
  1: ComponentValidator[]

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ComponentValidator)
  2: ComponentValidator[]

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ComponentValidator)
  3: ComponentValidator[]


  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ComponentValidator)
  4: ComponentValidator[]


  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ComponentValidator)
  5: ComponentValidator[]
}

class MessageEmbedFieldValidator {
  @IsDefined()
  @IsString()
  name: string

  @IsDefined()
  @IsString()
  value: string

  @IsOptional()
  @IsBoolean()
  inline: boolean

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]
}


class MessageEmbedValidator {
  @IsOptional()
  @IsString({ each: true })
  title: string | string[]

  @IsOptional()
  @IsString({ each: true })
  description: string | string[]

  @IsOptional()
  @IsString({ each: true })
  url: string

  @IsOptional()
  @IsString({ each: true })
  color: string | string[]

  @IsOptional()
  @IsBoolean()
  timestamp: boolean

  @IsOptional()
  @IsString({ each: true })
  footer: string | string[]

  @IsOptional()
  @IsString({ each: true })
  'footer-icon': string | string[]

  @IsOptional()
  @IsString({ each: true })
  image: string | string[]

  @IsOptional()
  @IsString({ each: true })
  thumbnail: string | string[]

  @IsOptional()
  @IsString({ each: true })
  author: string | string[]

  @IsOptional()
  @IsString({ each: true })
  'author-icon': string | string[]

  @IsOptional()
  @IsString({ each: true })
  'author-url': string | string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageEmbedFieldValidator)
  fields: MessageEmbedFieldValidator[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]
}

export class MessageValidator {
  @IsOptional()
  @IsString({ each: true })
  content: string | string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageEmbedValidator)
  embeds: MessageEmbedValidator[]

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageComponentValidator)
  components: MessageComponentValidator

  @IsOptional()
  @IsBoolean()
  ephemeral: boolean

  @IsOptional()
  @IsBoolean()
  'disable-mentions': boolean
}

