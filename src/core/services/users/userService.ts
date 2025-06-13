import { Manager, User, Service } from '@itsmybot';
import { GuildMember } from 'discord.js';

/**
 * Service to manage users in the bot.
 * Users are used to store information about Discord users.
 */
export default class UserService extends Service {
  constructor(manager: Manager) {
    super(manager);
    this.manager.database.addModels([User]);
  }

  async initialize() {
    await User.sync({ alter: true });
    this.manager.logger.info("User service initialized.");
  }

  async findOrNull(userId: string): Promise<User | null> {
    return User.findOne({ where: { id: userId } });
  }

  async find(userId: string): Promise<User> {
    const user = await this.findOrNull(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  async findOrCreate(member: GuildMember): Promise<User> {
    const userData = {
      id: member.id,
      username: member.user.username,
      displayName: member.user.displayName || member.user.globalName || member.user.username,
      avatar: member.displayAvatarURL(),
      createdAt: Math.round(member.user.createdTimestamp / 1000),
      joinedAt: member.joinedTimestamp ? Math.round(member.joinedTimestamp / 1000) : new Date().getTime(),
      roles: member.roles.cache
        .filter(r => r.id != member.guild.roles.everyone.id)
        .map(r => r.id),
    };

    return User.upsert(userData, { returning: true }).then(([user]) => user);
  }
}
