import { Manager, Meta, Service } from '@itsmybot';

export default class MetaHandler extends Service {
  constructor(manager: Manager) {
    super(manager);
    this.manager.database.addModels([Meta]);
  }

  async initialize() {
    await Meta.sync({ alter: true });
    this.manager.logger.info("Meta handler initialized.");
  }

  async createOrUpdate(key: string, mode: 'global' | 'user' | 'channel', type: string, value: string, scopeId: string = 'global' ): Promise<Meta> {
    const meta = await Meta.findOne({ where: { key, mode, type, scopeId } });
    
    if (meta) {
      await meta.setValue(value);
      return meta;
    }

    return Meta.create({ key, mode, type, value, scopeId });
  }

  async findOrCreate(key: string, mode: 'global' | 'user' | 'channel', type: string, value: string, scopeId: string = 'global'): Promise<Meta> {
    const meta = await Meta.findOne({ where: { key, mode, type, scopeId } });
    
    if (meta) return meta;

    return Meta.create({ key, mode, type, value, scopeId });
  }
}
