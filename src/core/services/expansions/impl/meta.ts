import { Expansion, Context, Meta } from '@itsmybot';


export default class MetaExpansion extends Expansion {
  name = 'meta';

  async onRequest(context: Context, placeholder: string) {
    const isHasCheck = placeholder.startsWith('has_');
    const clean = isHasCheck ? placeholder.slice(4) : placeholder;

    const [key, mode, type, fallback] = clean.split('_');

    const validModes = new Set(['user', 'global', 'channel']);
    const validTypes = new Set(['string', 'number', 'boolean']);

    if (!key || !validModes.has(mode) || !validTypes.has(type)) return;

    const scopeId = this.resolveScopeId(context, mode);
    if (!scopeId) return;

    const meta = await Meta.findOne({ where: { key, mode, type, scopeId } });

    if (isHasCheck) return meta ? 'true' : 'false';

    return meta?.value ?? fallback;
  }

  private resolveScopeId(context: Context, mode: string): string | undefined {
    switch (mode) {
      case 'global':
        return 'global';
      case 'user':
        return context.user?.id;
      case 'channel':
        return context.channel?.id;
      default:
        return undefined;
    }
  }
}