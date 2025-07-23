import { Manager, MetaData, Service, BaseConfigSection, Context } from '@itsmybot';
import MetaConfig from '../../../resources/scripting/meta.js';

interface Meta {
  key: string;
  type: MetaType;
  default: string;
  mode: MetaMode;
}

export enum MetaMode {
  GLOBAL = 'global',
  USER = 'user',
  CHANNEL = 'channel',
  MESSAGE = 'message'
}

export enum MetaType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  LIST = 'list'
}

export default class MetaHandler extends Service {
  metas = new Map<string, Meta>();

  constructor(manager: Manager) {
    super(manager);
    this.manager.database.addModels([MetaData]);
  }

  async initialize() {
    await MetaData.sync({ force: true });
    await this.loadMetas();
    this.manager.logger.info("Meta handler initialized.");
  }

  async loadMetas() {
    const metas = await new BaseConfigSection(this.manager.logger, 'scripting/metas', 'build/core/resources/scripting/metas').initialize(MetaConfig);
    for (const filePath of metas) {
      for (const config of filePath[1].getSubsections('metas')) {
        this.registerMeta(
          config.getString("key"),
          config.getString("mode") as MetaMode,
          config.getString("type") as MetaType,
          config.getStringOrNull("default")
        );
      }
    }
  }

  async registerMeta(key: string, mode: MetaMode, type: MetaType, defaultValue?: string) {
    if (this.metas.has(key)) {
      this.manager.logger.warn(`Meta with key ${key} is already registered.`);
      return;
    }

    const defaultValues = {
      [MetaType.STRING]: '',
      [MetaType.NUMBER]: '0',
      [MetaType.BOOLEAN]: 'false',
      [MetaType.LIST]: '[]'
    };

    if (!defaultValue) {
      defaultValue = defaultValues[type];
    }

    this.metas.set(key, { key, type, mode, default: defaultValue });
  }

  async findOrCreate(key: string, value?: string, scopeId: string = 'global'): Promise<MetaData> {
    const metaConfig = this.metas.get(key);
    if (!metaConfig) {
      throw new Error(`Meta with key ${key} is not registered.`);
    }

    const meta = await MetaData.findOne({ where: { key, scopeId } });
    if (meta) return meta;

    return MetaData.create({ key, mode: metaConfig.mode, type: metaConfig.type, value: value || metaConfig.default, scopeId });
  }

  resolveScopeId(context: Context, mode: string): string | undefined {
    switch (mode) {
      case 'global': return 'global';
      case 'user': return context.user?.id;
      case 'channel': return context.channel?.id;
      case 'message': return context.message?.id;
      default: return undefined;
    }
  }
}
