import { Manager, User, Service } from '@itsmybot';
import { GuildMember, User as DiscordUser } from 'discord.js';

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

  async findOrCreate(member: DiscordUser | GuildMember): Promise<User> {
    const user = member instanceof DiscordUser ? member : member.user
    const joinedTimestamp = member instanceof GuildMember ? member.joinedTimestamp : null
    const memberRoles = member instanceof GuildMember 
      ? member.roles.cache
        .filter(r => r.id != member.guild.roles.everyone.id)
        .map(r => r.id)
      : []

    const userData = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.globalName || user.username,
      avatar: user.displayAvatarURL(),
      isBot: user.bot,
      createdAt: Math.round(user.createdTimestamp / 1000),
      joinedAt: joinedTimestamp ? Math.round(joinedTimestamp / 1000) : undefined,
      roles: memberRoles
    };

    return User.upsert(userData, { returning: true }).then(([user]) => user);
  }
}
