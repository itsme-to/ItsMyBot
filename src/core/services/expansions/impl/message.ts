import { Expansion, Context, Utils } from '@itsmybot';

export default class MessageExpansion extends Expansion {
  name = 'message';

  async onRequest(context: Context, placeholder: string) {

    if (!context.message) return

    switch (placeholder) {
      case 'id':
        return context.message.id;
      case 'content':
        return Utils.blockPlaceholders(context.message.content);
      case 'author_id':
        return context.message.author.id;
      case 'url':
        return context.message.url;
    }
  }
}