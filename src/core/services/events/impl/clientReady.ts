import chalk from 'chalk';
import { schedule } from 'node-cron';
import { Event, Events } from '@itsmybot';
import { Client, Guild } from 'discord.js';

export default class ClientReadyEvent extends Event {
  name = Events.ClientReady;
  once = true;
  priority = 1

  async execute(client: Client) {
    this.manager.services.command.deployCommands();

    this.logger.info(`Actions registered: ${this.manager.services.action.actions.size}`);
    this.logger.info(`Conditions registered: ${this.manager.services.condition.conditions.size}`);
    this.logger.info(`Commands registered: ${this.manager.commands.size}`);
    this.logger.info(`Events registered: ${this.manager.events.size}`);
    this.logger.info(`Addons registered: ${this.manager.addons.size}`);
    this.logger.info(`Placeholder Expansions registered: ${this.manager.expansions.size}`);
    this.logger.info(`Metas registered: ${this.manager.services.engine.metaHandler.metas.size}`);
    this.logger.info(`Custom Commands registered: ${this.manager.services.engine.customCommands.size}`);
    this.logger.info(`Scripts registered: ${this.manager.services.engine.scripts.size}`);
    this.logger.empty("#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#");
    this.logger.empty(" ");
    this.logger.empty(`                    • ${chalk.hex("#57ff6b").bold(`ItsMyBot v${this.manager.managerOptions.package.version}`)} is now Online! •`);
    this.logger.empty(" ");
    this.logger.empty("         • Join our Discord Server for any Issues/Custom Addon •");
    this.logger.empty(`                         ${chalk.blue(chalk.underline(`https://itsme.to/discord`))}`);
    this.logger.empty(" ");
    this.logger.empty("#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#");
    this.logger.info("Bot ready");

    let primaryGuild: Guild | undefined;
    for (const guild of client.guilds.cache.values()) {
        if (guild.id === this.manager.primaryGuildId) {
          primaryGuild = guild;
          break;
        }
    }

    if (primaryGuild) {
      this.logger.info(`${client.guilds.cache.size} guilds found`);
      this.logger.info(`Connected to ${chalk.hex("#ffbe0b")(primaryGuild.name)}`);
    } else {
      this.logger.error("Primary Guild not found");
      this.logger.error("Please invite the bot to the primary guild");
      this.logger.error(chalk.blue(chalk.underline(`https://discord.com/api/oauth2/authorize?client_id=${this.manager.client.user!.id}&permissions=8&scope=applications.commands%20bot`)));
      return process.exit(1);
    }

    this.manager.client.emit(Events.BotReady, primaryGuild);

    schedule('* * * * *', async () => {
      await primaryGuild.fetch()
      this.manager.client.emit(Events.EveryMinute, primaryGuild);
    });

    schedule('0 * * * *', async () => {
      this.manager.client.emit(Events.EveryHour, primaryGuild);
    });

    schedule('0 0 * * *', async () => {
      this.manager.client.emit(Events.EveryDay, primaryGuild);
    });
  }
};