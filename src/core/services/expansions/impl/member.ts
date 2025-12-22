import { Expansion, Context } from '@itsmybot';

export default class MemberExpansion extends Expansion {
  name = 'member';

  async onRequest(context: Context, placeholder: string) {

    if (!context.member) return

    switch (placeholder) {
      case 'display_name':
        return context.member.displayName;
      case 'server_avatar': // Avatar defined by server profile
        return context.member.displayAvatarURL() || context.member.user.displayAvatarURL();
      case 'global_avatar':
        return context.member.user.displayAvatarURL();
      case 'timed_out_until_date':
        return context.member.communicationDisabledUntil?.toDateString() || "Not timed out";
      case 'timed_out_until_timestamp':
        return context.member.communicationDisabledUntilTimestamp?.toString() || "Not timed out";
      case 'join_date':
        return context.member.joinedAt?.toDateString() || "N/A";
      case 'join_timestamp':
        return context.member.joinedTimestamp?.toString() || "N/A";
      case 'pending':
        return context.member.pending.toString();
      case 'server_booster':
        return context.member.premiumSince ? 'true' : 'false';
      case 'booster_date':
        return context.member.premiumSince?.toDateString() || "Not Boosting";
      case 'booster_timestamp':
        return context.member.premiumSinceTimestamp?.toString() || "Not Boosting";
      case 'presence_status':
        return context.member.presence?.status || "N/A";
    }
  }
}