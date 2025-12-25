import { Expansion, Context } from '@itsmybot';
import { roleMention } from 'discord.js';

export default class RoleExpansion extends Expansion {
  name = 'role';

  async onRequest(context: Context, placeholder: string) {

    if (!context.role) return

    switch (placeholder) {
      case 'id':
        return context.role.id;
      case 'name':
        return context.role.name;
      case 'mention':
        return roleMention(context.role.id);
      case 'color':
        return context.role.hexColor;
      case 'created-at':
        return context.role.createdAt.toISOString();
      case 'position':
        return context.role.position.toString();
      case 'hoist':
        return context.role.hoist ? 'true' : 'false';
      case 'managed':
        return context.role.managed ? 'true' : 'false';
      case 'mentionable':
        return context.role.mentionable ? 'true' : 'false';
    }
  }
}