import { Type } from 'class-transformer';
import { IsString, IsArray, IsBoolean, IsOptional, IsDefined, ValidateNested, IsIn, IsInt, Validate } from 'class-validator';
import { ConditionValidator } from '@itsmybot';
import { IsBooleanOrString } from '../decorators/validator.js';

function ActionRowComponentType() {
  return Type(() => Component, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ButtonValidator, name: 'button' },
        { value: SelectMenuValidator, name: 'select-menu' }
      ],
    },
    keepDiscriminatorProperty: true
  });
}

class WithCondition {
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ConditionValidator)
  conditions: ConditionValidator[]
}

export abstract class Component extends WithCondition {
  @IsDefined()
  @IsString()
  @IsIn(['button', 'select-menu', 'text-display', 'action-row', 'separator', 'section', 'media-gallery', 'file', 'container'])
  type: 'button' | 'select-menu' | 'text-display' | 'action-row' | 'separator' | 'section' | 'media-gallery' | 'file' | 'container'
}

export class ButtonValidator extends Component {
  @IsOptional()
  @IsString({ each: true })
  style: string | string[]

  @IsOptional()
  @IsString({ each: true })
  'custom-id': string | string[]

  @IsOptional()
  @Validate(IsBooleanOrString)
  disabled: boolean | string

  @IsOptional()
  @IsString({ each: true })
  label: string | string[]

  @IsOptional()
  @IsString({ each: true })
  emoji: string | string[]

  @IsOptional()
  @IsString({ each: true })
  url: string | string[]
}

class OptionsValidator extends WithCondition {
  @IsOptional()
  @IsString()
  label: string

  @IsOptional()
  @IsString()
  value: string

  @IsOptional()
  @IsString()
  emoji: string

  @IsOptional()
  @IsBoolean()
  default: boolean

  @IsOptional()
  @IsString()
  description: string
}

export class SelectMenuValidator extends Component {
  @IsOptional()
  @IsString({ each: true })
  'custom-id': string | string[]
  
  @IsOptional()
  @IsString({ each: true })
  placeholder: string | string[]

  @IsOptional()
  @IsInt({ each: true })
  'min-values': number | number[]

  @IsOptional()
  @IsInt({ each: true })
  'max-values': number | number[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionsValidator)
  options: OptionsValidator[]
}

export class SeparatorValidator extends Component {
  @IsOptional()
  @IsBoolean()
  divider: boolean

  @IsOptional()
  @IsIn([1, 2])
  spacing: 1 | 2
}

class TextDisplayValidator extends Component {
  @IsOptional()
  @IsString({ each: true })
  content: string | string[]
}

class ThumbnailValidator extends Component {
  @IsDefined()
  @IsString({ each: true })
  url: string | string[]

  @IsOptional()
  @IsString({ each: true })
  description: string | string[]

  @IsOptional()
  @IsBoolean()
  spoiler: boolean
}

class ActionRowValidator extends Component {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  components: ButtonValidator[] | SelectMenuValidator[]
}

class MediaGalleryItemValidator extends WithCondition {
  @IsDefined()
  @IsString({ each: true })
  url: string | string[]

  @IsOptional()
  @IsString({ each: true })
  description: string | string[]

  @IsOptional()
  @IsBoolean()
  spoiler: boolean
}

class MediaGalleryValidator extends Component {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => MediaGalleryItemValidator)
  items: MediaGalleryItemValidator[]
}

class FileValidator extends Component {
  @IsDefined()
  @IsString({ each: true })
  url: string | string[]

  @IsOptional()
  @IsBoolean()
  spoiler: boolean
}

class SectionValidator extends Component {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TextDisplayValidator)
  components: TextDisplayValidator[]

  @IsOptional()
  @ValidateNested()
  @Type(() => Component, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ThumbnailValidator, name: 'thumbnail' },
        { value: ButtonValidator, name: 'button' }
      ],
    },
    keepDiscriminatorProperty: true
  })
  accessory: ThumbnailValidator | ButtonValidator
}

class ContainerValidator extends Component {
  @IsOptional()
  @IsString({ each: true })
  color: string | string[]

  @IsOptional()
  @IsBoolean()
  spoiler: boolean

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Component, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: SeparatorValidator, name: 'separator' },
        { value: ActionRowValidator, name: 'action-row' },
        { value: TextDisplayValidator, name: 'text-display' },
        { value: SectionValidator, name: 'section' },
        { value: MediaGalleryValidator, name: 'media-gallery' },
        { value: FileValidator, name: 'file' }
      ],
    },
    keepDiscriminatorProperty: true
  })
  components: (SeparatorValidator | ActionRowValidator | TextDisplayValidator | SectionValidator | MediaGalleryValidator | FileValidator)[]
}


class ActionRowsValidator {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  1: SelectMenuValidator[] | ButtonValidator[]

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  2: SelectMenuValidator[] | ButtonValidator[]

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  3: SelectMenuValidator[] | ButtonValidator[]


  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  4: SelectMenuValidator[] | ButtonValidator[]


  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  5: SelectMenuValidator[] | ButtonValidator[]
}

class MessageEmbedFieldValidator extends WithCondition {
  @IsDefined()
  @IsString()
  name: string

  @IsDefined()
  @IsString()
  value: string

  @IsOptional()
  @IsBoolean()
  inline: boolean
}

class MessageEmbedValidator extends WithCondition {
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
  @Type(() => ActionRowsValidator)
  'action-rows': ActionRowsValidator
  
  @IsOptional()
  @IsArray({
    message: 'Components are now using Discord’s new style for building message layouts. To keep using the old system, please rename ‘components’ to ‘action-rows’'
  })
  @ValidateNested({ each: true })
  @Type(() => Component, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: SeparatorValidator, name: 'separator' },
        { value: ActionRowValidator, name: 'action-row' },
        { value: TextDisplayValidator, name: 'text-display' },
        { value: SectionValidator, name: 'section' },
        { value: MediaGalleryValidator, name: 'media-gallery' },
        { value: FileValidator, name: 'file' },
        { value: ContainerValidator, name: 'container' }
      ],
    },
    keepDiscriminatorProperty: true
  })
  components: (ContainerValidator | TextDisplayValidator | ActionRowValidator | MediaGalleryValidator | SectionValidator | SeparatorValidator | FileValidator)[]

  @IsOptional()
  @IsBoolean()
  ephemeral: boolean

  @IsOptional()
  @IsBoolean()
  'disable-mentions': boolean
}