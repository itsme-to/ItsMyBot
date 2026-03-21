import { Expansion, Context, Utils } from '@itsmybot';

export default class LeaderboardExpansion extends Expansion {
  name = 'leaderboard';

  async onRequest(context: Context, placeholder: string) {
    const [leaderboardName, ...rest] = placeholder.split('_');
    const subplaceholder = rest.join('_');

    const leaderboard = this.manager.services.leaderboard.leaderboards.get(leaderboardName);
    if (!leaderboard) return;

    const data = await this.manager.services.leaderboard.getLeaderboardData(leaderboard);

    if (subplaceholder.startsWith('top_')) {
      const [, positionStr, ...valueNameParts] = subplaceholder.split('_');
      const valueName = valueNameParts.length ? valueNameParts.join('_') : null;
      const position = parseInt(positionStr);
      const entry = data.find(e => e.position === position);

      switch (valueName) {
        case 'value':
          return entry ? entry.value.toString() : '0';
        case 'value_formatted':
          return entry ? await leaderboard.formatValue(entry) : '0';
        case null:
        case 'user':
          if (!entry) return 'None';
          const user = await this.manager.services.user.findOrNull(entry.userId);
          return user ? user.username: 'User not found';
      }

      if (valueName.startsWith('user_')) {
        if (!entry) return 'None';
        const user = await this.manager.services.user.findOrNull(entry.userId);
        if (!user) return 'User not found';

        const userFormat = await Utils.applyVariables(`[[${valueName}]]`, Utils.userVariables(user));
        if (userFormat === `[[${valueName}]]`) {
          return 'Unknown placeholder';
        }

        return userFormat;
      }
    }
  }
}