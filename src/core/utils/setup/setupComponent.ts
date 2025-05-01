import Utils from '@utils';
import manager, { Config, Context, Variable } from '@itsmybot';
import { ActionRowComponent, MessageComponentBuilder, ContainerComponentBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, SeparatorBuilder, SectionBuilder, MediaGalleryBuilder, FileBuilder } from 'discord.js';

interface ComponentSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export type SetupComponentType = MessageComponentBuilder | ContainerComponentBuilder | ActionRowComponent | undefined;

export async function setupComponent<T extends SetupComponentType = SetupComponentType>(settings: ComponentSettings): Promise<T | undefined> {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const type = config.getString('type');

  const conditionConfig = config.getSubsectionsOrNull('conditions');
  if (conditionConfig) {
    const conditions = manager.services.condition.buildConditions(conditionConfig, false);
    const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
    if (!isMet) return
  }

  switch (type) {
    case 'button': {
      return Utils.setupButton({ config, variables, context }) as Promise<T>;
    }
  
    case 'select-menu': {
      return Utils.setupSelectMenu({ config, variables, context }) as Promise<T>;
    }

    case 'text-display': {
      return Utils.setupTextDisplay({ config, variables, context }) as Promise<T>;
    }

    case 'separator': {
      const separator = new SeparatorBuilder()
        .setSpacing(config.getNumber('spacing'))
        .setDivider(config.getBoolOrNull('divider') || true)

      return separator as T
    }

    case 'section': {
      const section = new SectionBuilder()
      
      for (const componentConfig of config.getSubsections('components')) {
        const conditionConfig = componentConfig.getSubsectionsOrNull('conditions');
        if (conditionConfig) {
          const conditions = manager.services.condition.buildConditions(conditionConfig, false);
          const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
          if (!isMet) continue
        }

        const textDisplay = await Utils.setupTextDisplay({ config: componentConfig, variables, context });
        section.components.push(textDisplay);
      }

      if (!section.components.length) return

      const accessory = config.getSubsectionOrNull('accessory')
      if (accessory) {
        const conditionConfig = accessory.getSubsectionsOrNull('conditions');
        if (conditionConfig) {
          const conditions = manager.services.condition.buildConditions(conditionConfig, false);
          const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
          if (!isMet) return section as T
        } 

        if (accessory.getString('type') === 'button') {
          section.setButtonAccessory(await Utils.setupButton({ config: accessory, variables, context }))
        } else {
          section.setThumbnailAccessory(await Utils.setupThumbnail({ config: accessory, variables, context }))
        }
      }

      return section as T
    }

    case 'thumbnail': {
      return Utils.setupThumbnail({ config, variables, context }) as Promise<T>
    }

    case 'media-gallery': {
      const mediaGallery = new MediaGalleryBuilder()
      
      for (const mediaconfig of config.getSubsections('items')) {
        const mediaCondition = mediaconfig.getSubsectionsOrNull('conditions');
        if (mediaCondition) {
          const conditions = manager.services.condition.buildConditions(mediaCondition, false);
          const isMet = await manager.services.condition.meetsConditions(conditions, context, variables);
          if (!isMet) continue
        }
        
        mediaGallery.addItems((await Utils.setupThumbnail({ config: mediaconfig, variables, context })).toJSON())
      }

      if (!mediaGallery.items.length) return

      return mediaGallery as T
    }

    case 'file': {
      const file = new FileBuilder()
        .setSpoiler(config.getBoolOrNull('spoiler') || false)
        .setURL(await Utils.applyVariables(config.getString('url', true), variables, context))

      return file as T
    }

    case 'action-row': {
      const components = config.getSubsections('components');
      const actionRow = new ActionRowBuilder();

      for (const componentConfig of components) {
        const component = await Utils.setupComponent<MessageActionRowComponentBuilder>({ config: componentConfig, variables, context });
        if (component) actionRow.addComponents(component);
      }

      return actionRow as T;
    }

    case 'container': {
      return Utils.setupContainer({ config, variables, context }) as Promise<T>;
    }
  }
}