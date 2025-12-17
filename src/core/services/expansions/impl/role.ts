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
    }
  }
}