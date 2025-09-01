import { CommandBuilder } from '@builders';
import { Command, User, CommandInteraction } from '@itsmybot';
import Utils from '@utils';

export default class ReloadCommand extends Command {

  build() {
    const command = this.manager.configs.commands.getSubsection("reload");

    return new CommandBuilder()
      .setName('reload')
      .setPublic()
      .using(command)
  }

  async execute(interaction: CommandInteraction, user: User) {
    this.logger.info(`Reloading the bot...`);
    this.manager.commands.clear()
    await this.manager.services.command.initialize()
    await this.manager.services.leaderboard.registerLeaderboards()
    this.manager.services.engine.event.removeAllListeners()
    this.manager.services.engine.scripts.clear()
    this.manager.services.engine.metaHandler.metas.clear()

    let error: unknown

    try {
      await this.manager.services.engine.loadScripts();
      await this.manager.services.engine.metaHandler.loadMetas();
      await this.manager.services.engine.registerCustomCommands();

      await Promise.all(this.manager.addons.map(async addon => {
        await addon.unload()
        await addon.load()
        await addon.registerCommands()
      }))
    } catch (e) {
      error = e
    }

    this.logger.info(`Bot reloaded! Deploying commands...`);
    this.manager.services.command.deployCommands();

    if (error) {
      return interaction.reply(await Utils.setupMessage({
        config: this.manager.configs.lang.getSubsection(`error-reloading`),
        variables: [
          { searchFor: "%error_message%", replaceWith: error.toString() }
        ],
        context: {
          user: user,
          guild: interaction.guild,
          channel: interaction.channel || undefined
        }
      }));
    }

    interaction.reply(await Utils.setupMessage({
      config: this.manager.configs.lang.getSubsection(`reloaded`),
      context: {
        user: user,
        guild: interaction.guild,
        channel: interaction.channel || undefined
      }
    }));
  }
}
