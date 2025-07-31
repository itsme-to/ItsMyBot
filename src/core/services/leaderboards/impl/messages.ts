import { Op } from 'sequelize';
import { User, Leaderboard } from '@itsmybot';
import Utils from '@utils';

export default class MessagesLeaderboard extends Leaderboard {
  name = "messages"
  description = "Messages leaderboard."

  async getData() {
    const data = await User.findAll({
      order: [['messages', 'DESC']],
      where: {
        messages: {
          [Op.gt]: 0
        },
        isBot: false
      }
    });

    const messageFormat = this.manager.configs.lang.getString("leaderboard.messages-format")

    const formattedData = data.map((user, index) => {
      return Utils.applyVariables(messageFormat, [
        { searchFor: "%position%", replaceWith: index + 1 },
      ], {
        user: user
      })
    })

    return Promise.all(formattedData)
  }
}
