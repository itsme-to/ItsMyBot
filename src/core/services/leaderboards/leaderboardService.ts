import { Manager, Leaderboard, Command, Addon, CommandInteraction, Service } from '@itsmybot';
import { Collection } from 'discord.js';
import { CommandBuilder } from '@builders';
import Utils, { Pagination } from '@utils';
import { sync } from 'glob';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Service to manage leaderboards in the bot.
 */
export default class LeaderboardService extends Service{
  leaderboards: Collection<string, Leaderboard<Addon | undefined>>;

  constructor(manager: Manager) {
    super(manager);
    this.leaderboards = new Collection();
  }

  async initialize() {
    this.manager.logger.info("Leaderboard services initialized.");
    await this.registerFromDir(join(dirname(fileURLToPath(import.meta.url)), 'impl'))
  }

  async registerFromDir(leaderboardsDir: string, addon: Addon | undefined = undefined) {
    const leaderboardFiles = sync(join(leaderboardsDir, '**', '*.js').replace(/\\/g, '/'));

    for (const filePath of leaderboardFiles) {
      const leaderboardPath = new URL('file://' + filePath.replace(/\\/g, '/')).href;
      const { default: leaderboard } = await import(leaderboardPath);

      this.registerLeaderboard(new leaderboard(this.manager, addon));
    };
  }

  registerLeaderboard(leaderboard: Leaderboard<Addon | undefined>) {
    if (this.leaderboards.has(leaderboard.name)) {
      return this.manager.logger.error(`An leaderboard with the identifier ${leaderboard.name} is already registered.`);
    }
    this.leaderboards.set(leaderboard.name, leaderboard);
  }

  unregisterLeaderboard(identifier: string) {
    this.leaderboards.delete(identifier);
  }

  async registerLeaderboards() {
    class LeaderboardCommands extends Command {

      build() {
        const data = new CommandBuilder()
          .setName('leaderboard')
          .using(this.manager.configs.commands.getSubsection('leaderboard'))

        for (const [key, leaderboard] of this.manager.services.leaderboard.leaderboards) {
          data.addSubcommand(subcommand =>
            subcommand
              .setName(key)
              .setDescription(leaderboard.description))
        }

        return data;
      }

      async execute(interaction: CommandInteraction) {
        await this.manager.services.leaderboard.leaderboardCommand(interaction, interaction.options.getSubcommand());
      }
    }

    this.manager.services.interaction.registerCommand(new LeaderboardCommands(this.manager));
  }

  async leaderboardCommand(interaction: CommandInteraction, indentifier: string) {
    const leaderboard = this.leaderboards.get(indentifier)
    if (!leaderboard) return interaction.reply("Leaderboard not found.");

    const leaderboardData = await leaderboard.getData();
    const leaders = []
    let rank = 0;

    for (const row of leaderboardData) {
      const variables = [
        { searchFor: "%leaderboard_position%", replaceWith: rank++ },
        { searchFor: "%leaderboard_message%", replaceWith: row }
      ];

      leaders.push({
        variables: variables,
      });
    }

    new Pagination(interaction, leaders, this.manager.configs.lang.getSubsection('leaderboard'))
      .setType('button')
      .setVariables([{ searchFor: "%leaderboard_name%", replaceWith: Utils.capitalizeFirst(leaderboard.name) }])
      .setItemsPerPage(10)
      .send();
  }
}