import { Expansion, Context } from '@itsmybot';
import { channelMention, time } from 'discord.js';

export default class ChannelExpansion extends Expansion {
    name = 'channel';

    async onRequest(context: Context, placeholder: string) {

        if (!context.channel) return

        switch (placeholder) {
            case 'id':
                return context.channel.id;
            case 'name':
                return context.channel.isDMBased() ? "DM" : context.channel.name;
            case 'mention':
                return channelMention(context.channel.id);
            case 'type':
                return context.channel.type.toString();
            case 'create_date':
                return context.channel.createdTimestamp ? time(Math.round(context.channel.createdTimestamp / 1000), "D") : "Unknown";
            case 'topic':
                return !context.channel.isDMBased() && !context.channel.isThread() && !context.channel.isVoiceBased() && context.channel.isTextBased() ? context.channel.topic || '' : "None";
            case 'url':
                return context.channel.url;
            case 'parent_id':
                return context.channel.isDMBased() ? 'N/A' : context.channel.parent?.id || 'N/A';
        }
    }
}