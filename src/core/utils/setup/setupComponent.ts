import Utils from '@utils';
import manager, { Config, Context, Variable } from '@itsmybot';
import { ActionRowComponent, MessageComponentBuilder, ContainerComponentBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, SeparatorBuilder, SectionBuilder, MediaGalleryBuilder, FileBuilder, MediaGalleryItemBuilder } from 'discord.js';

interface ComponentSettings {
  config: Config,
  variables?: Variable[],
  context: Context,
}

export type SetupComponentType = MessageComponentBuilder | ContainerComponentBuilder | ActionRowComponent | undefined;

export async function setupComponent<T extends SetupComponentType = SetupComponentType>(settings: ComponentSettings): Promise<T[] | undefined> {
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
      return [await Utils.setupButton({ config, variables, context }) as T];
    }
  
    case 'select-menu': {
      return [await Utils.setupSelectMenu({ config, variables, context }) as T];
    }

    case 'text-display': {
      return [await Utils.setupTextDisplay({ config, variables, context }) as T];
    }

    case 'repeat': {
      const dataSource = config.getString('data-source', true);
      const template = config.getSubsections('template');
      const data = context.data?.get(dataSource);
      if (!data) {
        config.logger.warn(`Repeat data source "${dataSource}" not found.`);
        return
      }
      const components: T[] = [];
      for (const item of data) {
        for (const componentConfig of template) {
          const varbles = [...variables, ...item.variables]
          const ctxt = { ...context, ...item.context }
          const component = await Utils.setupComponent<T>({ config: componentConfig, variables: varbles, context: ctxt });
          if (component) components.push(...component);
        }
      }

      if (!components.length) return 
      return components
    }

    case 'separator': {
      const separator = new SeparatorBuilder()
        .setSpacing(config.getNumber('spacing'))
        .setDivider(config.getBoolOrNull('divider') || true)

      return [separator as T]
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
        section.addTextDisplayComponents(textDisplay);
      }

      if (!section.components.length) return

      const accessory = config.getSubsection('accessory')
      if (accessory.getString('type') === 'button') {
        section.setButtonAccessory(await Utils.setupButton({ config: accessory, variables, context }))
      } else {
        section.setThumbnailAccessory(await Utils.setupThumbnail({ config: accessory, variables, context }))
      }

      return [section as T]
    }

    case 'thumbnail': {
      return [await Utils.setupThumbnail({ config, variables, context }) as T]
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
        
        mediaGallery.addItems((await setupMediaGalleryItemBuilder({ config: mediaconfig, variables, context })))
      }

      if (!mediaGallery.items.length) return

      return [mediaGallery as T]
    }

    case 'file': {
      const file = new FileBuilder()
        .setSpoiler(config.getBoolOrNull('spoiler') || false)
        .setURL(await Utils.applyVariables(config.getString('url', true), variables, context))

      return [file as T]
    }

    case 'action-row': {
      const components = config.getSubsections('components');
      const actionRow = new ActionRowBuilder();

      for (const componentConfig of components) {
        const component = await Utils.setupComponent<MessageActionRowComponentBuilder>({ config: componentConfig, variables, context });
        if (component) actionRow.addComponents(component);
      }

      if (!actionRow.components.length) return

      return [actionRow as T]
    }

    case 'container': {
      return [await Utils.setupContainer({ config, variables, context }) as T];
    }
  }
}


async function setupMediaGalleryItemBuilder(settings: ComponentSettings)  {
  const config = settings.config;
  const variables = settings.variables || [];
  const context = settings.context;

  const description = await Utils.applyVariables(config.getStringOrNull('description', true), variables, context)

  const item = new MediaGalleryItemBuilder()
    .setSpoiler(config.getBoolOrNull('spoiler') || false)
    .setURL(await Utils.applyVariables(config.getString('url', true), variables, context))

  if (description) item.setDescription(description)

  return item
}