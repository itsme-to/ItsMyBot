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

    if (placeholder.startsWith('attachment_')) {
      const index = parseInt(placeholder.split('_')[1]);
      const attachment = context.message.attachments.at(index);
      if (!attachment) return;

      switch (placeholder.split('_')[2]) {
        case 'url':
          return attachment.url;
        case 'filename':
          return attachment.name;
        case 'size':
          return attachment.size.toString();
      }
    }
  }
}