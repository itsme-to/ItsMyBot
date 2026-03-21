import { Manager, MetaData, Service, ConfigFolder, Context, Config, Leaderboard, Utils, manager, Variable, LeaderboardEntry } from '@itsmybot';
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
    await MetaData.sync({ alter: true });
    await this.loadMetas();
    this.manager.logger.info("Meta handler initialized.");
  }

  async loadMetas() {
    const metas = await new ConfigFolder(this.manager.logger, 'scripting/metas', 'build/core/resources/scripting/metas').initialize(MetaConfig);
    for (const filePath of metas) {
      for (const config of filePath[1].getSubsections('metas')) {
        this.registerMeta(config);
      }
    }
  }

  async registerMeta(config: Config) {
    const key = config.getString("key");
    const mode = config.getString("mode") as MetaMode;
    const type = config.getString("type") as MetaType;
    let defaultValue = config.getStringOrNull("default");

    const leaderboardConfig = config.getSubsectionOrNull("leaderboard");
    if (leaderboardConfig && type === MetaType.NUMBER && mode === MetaMode.USER) {
      const enabled = leaderboardConfig.getBool("enabled");
      if (enabled) {
        const name = leaderboardConfig.getString("name");
        const description = leaderboardConfig.getString("description");
        const format = leaderboardConfig.getStringOrNull("format")
        
        class LeaderboardMeta extends Leaderboard {
          name = name;
          description = description;
        
          async getData() {
            const data = await MetaData.findAll({
              where: {
                key,
                mode: mode
              },
              order: [['value', 'DESC']]
            });
        
            const formattedData = data.map((metaData, index) => {
              return { position: index + 1, userId: metaData.scopeId, value: parseFloat(metaData.value) };
            });
        
            return formattedData;
          }

          formatValue(entry: LeaderboardEntry) {
            if (!format) return entry.value.toString();

            const variables: Variable[] = [
              { name: "value", value: entry.value }
            ];

            return Utils.applyVariables(format, variables);
            
          }
        }

        this.manager.services.leaderboard.registerLeaderboard(new LeaderboardMeta(manager));
      }
    }


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

  async findOrCreate(key: string, value: string, scopeId: string): Promise<MetaData> {
    const metaConfig = this.metas.get(key);
    if (!metaConfig) {
      throw new Error(`Meta with key ${key} is not registered.`);
    }

    const meta = await MetaData.findOrCreate({ where: { key, scopeId }, defaults: { key, mode: metaConfig.mode, type: metaConfig.type, value: value, scopeId } })
    return meta[0];
  }

  async findOrNull(key: string, scopeId: string): Promise<MetaData | null> {
    const metaConfig = this.metas.get(key);
    if (!metaConfig) {
      throw new Error(`Meta with key ${key} is not registered.`);
    }

    return MetaData.findOne({ where: { key, scopeId } });
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
