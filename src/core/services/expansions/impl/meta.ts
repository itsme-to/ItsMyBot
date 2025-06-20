import { Expansion, Context, MetaData } from '@itsmybot';

export default class MetaExpansion extends Expansion {
  name = 'meta';

  async onRequest(context: Context, placeholder: string) {
    const isHasCheck = placeholder.startsWith('has_');
    const isIncludeCheck = placeholder.startsWith('include_');

    const raw = placeholder.replace(/^(has_|include_)/, '');
    const parts = raw.split('_');

    const key = parts[0];
    const suffix = parts.slice(1).join('_'); 

    const metaDef = this.manager.services.engine.metaHandler.metas.get(key);
    if (!metaDef) return;

    const { type, mode } = metaDef;
    const scopeId = this.manager.services.engine.metaHandler.resolveScopeId(context, mode);
    if (!scopeId) return;

    const meta = await MetaData.findOne({ where: { key, mode, type, scopeId } });

    if (isHasCheck) return meta ? 'true' : 'false';

    if (type === 'list') {
      let list: string[] = [];

      try {
        list = JSON.parse(meta?.value || '[]');
      } catch {
        return '';
      }

      if (!Array.isArray(list)) return '';

      if (isIncludeCheck && suffix) {
        return list.includes(suffix) ? 'true' : 'false';
      }

      if (suffix === 'length') {
        return list.length.toString();
      }

      if (suffix === 'formatted') {
        return list.map(item => item.toString()).join(', ');
      }

      return JSON.stringify(list);
    }

    return meta?.value ?? '';
  }
}