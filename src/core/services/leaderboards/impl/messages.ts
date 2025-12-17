import { Op } from 'sequelize';
import { User, Leaderboard, Utils } from '@itsmybot';

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

    const messageFormat = this.manager.lang.getString("leaderboard.messages-format")

    const formattedData = data.map((user, index) => {
      const variables = [
        { name: "position", value: index + 1 },
        ...Utils.userVariables(user, 'position_user')
      ];

      return Utils.applyVariables(messageFormat, variables, { user: user })
    })

    return Promise.all(formattedData)
  }
}
