import { Manager, Leaderboard, Command, Addon, Service, Utils, Pagination, CommandBuilder, MessageComponentBuilder } from '@itsmybot';
import { ChatInputCommandInteraction, Collection, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { glob } from 'fs/promises';
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
    const leaderboardFiles = await Array.fromAsync(glob(join(leaderboardsDir, '**', '*.js').replace(/\\/g, '/')));

    await Promise.all(leaderboardFiles.map(async (filePath) => {
      const leaderboardPath = new URL('file://' + filePath.replace(/\\/g, '/')).href;
      const { default: leaderboard } = await import(leaderboardPath);

      this.registerLeaderboard(new leaderboard(this.manager, addon));
    }));
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

  unregisterByAddon(addon: Addon) {
    for (const [name, leaderboard] of this.leaderboards) {
      if (leaderboard.addon === addon) {
        this.leaderboards.delete(name);
      }
    }
  }

  async registerLeaderboards() {
    class LeaderboardCommands extends Command {

      build() {
        const data = new CommandBuilder()
          .setName('leaderboard')

        for (const [key, leaderboard] of this.manager.services.leaderboard.leaderboards) {
          data.addSubcommand(subcommand =>
            subcommand
              .setName(key)
              .setDescription(leaderboard.description))
        }

        return data;
      }

      async execute(interaction: ChatInputCommandInteraction<'cached'>) {
        await this.manager.services.leaderboard.leaderboardCommand(interaction, interaction.options.getSubcommand());
      }
    }

    this.manager.services.interaction.registerCommand(new LeaderboardCommands(this.manager));
  }

  async leaderboardCommand(interaction: ChatInputCommandInteraction<'cached'>, indentifier: string) {
    const leaderboard = this.leaderboards.get(indentifier)
    if (!leaderboard) return interaction.reply("Leaderboard not found.");

    const leaderboardData = await leaderboard.getData();
    const leaders = []
    let rank = 0;

    for (const row of leaderboardData) {
      const variables = [
        { name: "leaderboard_position", value: rank++ },
        { name: "leaderboard_message", value: row }
      ];

      leaders.push({
        item: row,
        variables: variables,
      });
    }

    new Pagination(leaders)
      .setType('button')
      .setFormat(async (items, variables, context) => {
        const components: MessageComponentBuilder[] = [];
        components.push(new TextDisplayBuilder()
          .setContent(await this.manager.lang.getParsedString("leaderboard.title", variables, context)));

        const container = new ContainerBuilder()
          .setAccentColor(Utils.getColorFromString(this.manager.configs.config.getString("default-color")))
        
        const messages = [];
        for (const item of items) {
          messages.push(item.item);
        }
        container.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(messages.join('\n')),
          new TextDisplayBuilder()
            .setContent(await this.manager.lang.getParsedString("leaderboard.footer", variables, context)));

        components.push(container);

        return components;
      })
      .setVariables([{ name: "leaderboard_name", value: Utils.capitalizeFirst(leaderboard.name) }])
      .setItemsPerPage(10)
      .reply(interaction);
  }
}