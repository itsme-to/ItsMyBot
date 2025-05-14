import { Type } from 'class-transformer';
import { IsString, IsArray, IsBoolean, IsOptional, IsDefined, ValidateNested, IsIn, IsInt, Validate } from 'class-validator';
import { ConditionValidator } from '@itsmybot';
import { IsBooleanOrString } from '../decorators/validator.js';

function ActionRowComponentType() {
  return Type(() => ComponentValidator, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ButtonValidator, name: 'button' },
        { value: SelectMenuValidator, name: 'select-menu' },
        { value: ListActionRowValidator, name: 'list' },
      ],
    },
    keepDiscriminatorProperty: true
  });
}

export type TopMessageComponentValidator = ButtonValidator | SelectMenuValidator | ListActionRowValidator | SeparatorValidator | SectionValidator | MediaGalleryValidator | FileValidator | ContainerValidator | TextDisplayValidator | ActionRowValidator
export function TypeTopMessageComponentValidator(){
  return Type(() => ComponentValidator, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: TextDisplayValidator, name: 'text-display' },
        { value: ActionRowValidator, name: 'action-row' },
        { value: SeparatorValidator, name: 'separator' },
        { value: SectionValidator, name: 'section' },
        { value: MediaGalleryValidator, name: 'media-gallery' },
        { value: FileValidator, name: 'file' },
        { value: ContainerValidator, name: 'container' },
        { value: ListComponentValidator, name: 'list' }
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

export abstract class ComponentValidator extends WithCondition {
  @IsDefined()
  @IsString()
  @IsIn(['button', 'select-menu', 'text-display', 'action-row', 'separator', 'section', 'media-gallery', 'file', 'container', 'list', 'thumbnail'])
  type: 'button' | 'select-menu' | 'text-display' | 'action-row' | 'separator' | 'section' | 'media-gallery' | 'file' | 'container' | 'list' | 'thumbnail'
}

export class ButtonValidator extends ComponentValidator {
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
  @IsDefined()
  @IsString()
  label: string

  @IsDefined()
  @IsString()
  value: string

  @IsOptional()
  @IsString()
  emoji: string

  @IsOptional()
  @Validate(IsBooleanOrString)
  default: boolean | string

  @IsOptional()
  @IsString()
  description: string
}

export class SelectMenuValidator extends ComponentValidator {
  @IsDefined()
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

  @IsOptional()
  @IsString()
  'data-source': string

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsValidator)
  template: OptionsValidator
}

export class SeparatorValidator extends ComponentValidator {
  @IsOptional()
  @IsBoolean()
  divider: boolean

  @IsOptional()
  @IsIn([1, 2])
  spacing: 1 | 2
}

class TextDisplayValidator extends ComponentValidator {
  @IsOptional()
  @IsString({ each: true })
  content: string | string[]
}

class ThumbnailValidator extends ComponentValidator {
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

class ListActionRowValidator extends ComponentValidator {
  @IsDefined()
  @IsString()
  'data-source': string

  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ComponentValidator, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ButtonValidator, name: 'button' },
        { value: SelectMenuValidator, name: 'select-menu' }
      ],
    },
    keepDiscriminatorProperty: true
  })
  template: ButtonValidator[] | SelectMenuValidator[]
}

class ActionRowValidator extends ComponentValidator {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  components: (ButtonValidator | ListActionRowValidator)[] | SelectMenuValidator[]
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

class MediaGalleryValidator extends ComponentValidator {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => MediaGalleryItemValidator)
  items: MediaGalleryItemValidator[]
}

class FileValidator extends ComponentValidator {
  @IsDefined()
  @IsString({ each: true })
  url: string | string[]

  @IsOptional()
  @IsBoolean()
  spoiler: boolean
}

class ListSectionValidator extends ComponentValidator {
  @IsDefined()
  @IsString()
  'data-source': string

  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TextDisplayValidator)
  template: TextDisplayValidator[]
}

class SectionValidator extends ComponentValidator {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentValidator, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: TextDisplayValidator, name: 'text-display' },
        { value: ListSectionValidator, name: 'list' }
      ],
    },
    keepDiscriminatorProperty: true
  })
  components: (TextDisplayValidator | ListSectionValidator)[]

  @IsDefined()
  @ValidateNested()
  @Type(() => ComponentValidator, {
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

class ListContainerValidator extends ComponentValidator {
  @IsDefined()
  @IsString()
  'data-source': string

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentValidator, {
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
  template: (TextDisplayValidator | ActionRowValidator | MediaGalleryValidator | SectionValidator | SeparatorValidator | FileValidator)[]
}

class ContainerValidator extends ComponentValidator {
  @IsOptional()
  @IsString({ each: true })
  color: string | string[]

  @IsOptional()
  @IsBoolean()
  spoiler: boolean

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentValidator, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: SeparatorValidator, name: 'separator' },
        { value: ActionRowValidator, name: 'action-row' },
        { value: TextDisplayValidator, name: 'text-display' },
        { value: SectionValidator, name: 'section' },
        { value: MediaGalleryValidator, name: 'media-gallery' },
        { value: FileValidator, name: 'file' },
        { value: ListContainerValidator, name: 'list' }
      ],
    },
    keepDiscriminatorProperty: true
  })
  components: (ListContainerValidator | SeparatorValidator | ActionRowValidator | TextDisplayValidator | SectionValidator | MediaGalleryValidator | FileValidator)[]
}


class ListComponentValidator extends ComponentValidator {
  @IsDefined()
  @IsString()
  'data-source': string

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentValidator, {
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
  template: (ContainerValidator | TextDisplayValidator | ActionRowValidator | MediaGalleryValidator | SectionValidator | SeparatorValidator | FileValidator)[]
}

class ActionRowsValidator {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  1: SelectMenuValidator[] | (ButtonValidator | ListActionRowValidator)[]

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  2: SelectMenuValidator[] | (ButtonValidator | ListActionRowValidator)[]

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  3: SelectMenuValidator[] | (ButtonValidator | ListActionRowValidator)[]


  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  4: SelectMenuValidator[] | (ButtonValidator | ListActionRowValidator)[]


  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @ActionRowComponentType()
  5: SelectMenuValidator[] | (ButtonValidator | ListActionRowValidator)[]
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
  @IsArray()
  @TypeTopMessageComponentValidator()
  components: TopMessageComponentValidator[]

  @IsOptional()
  @IsBoolean()
  ephemeral: boolean

  @IsOptional()
  @IsBoolean()
  'disable-mentions': boolean
}