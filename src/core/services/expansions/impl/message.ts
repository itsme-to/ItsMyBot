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
      case 'is_content_empty':
        return context.message.content.length === 0 ? 'true' : 'false';
      case 'author_id':
        return context.message.author.id;
      case 'url':
        return context.message.url;
      case 'attachment_count':
        return context.message.attachments.size.toString();
    }
  }
}