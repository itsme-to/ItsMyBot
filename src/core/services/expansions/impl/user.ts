import { Expansion, Context } from '@itsmybot';
import { time } from 'discord.js';

export default class UserExpansion extends Expansion {
    name = 'user';

    async onRequest(context: Context, placeholder: string) {

        if (!context.user) return

        switch (placeholder) {
            case 'id':
                return context.user.id;
            case 'display_name':
                return context.user.displayName;
            case 'username':
                return context.user.username;
            case 'mention':
                return context.user.mention;
            case 'avatar':
                return context.user.avatar || '';
            case 'bot':
                return context.user.isBot.toString();
            case 'create_date':
                return time(context.user.createdAt, "D");
            case 'join_date':
                return context.user.joinedAt ? time(context.user.joinedAt, "D") : 'Unknown';
            case 'roles':
                return context.user.roles ? context.user.roles.join(', ') : 'None';
            case 'messages':
                return context.user.messages.toString() || '0';
            case 'coins':
                return context.user.coins.toString() || '0';
        }
    }
}