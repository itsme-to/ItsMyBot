import { Command, User, CommandBuilder } from '@itsmybot';
import { ChatInputCommandInteraction } from 'discord.js';

export default class ReloadCommand extends Command {
  build() {
    return new CommandBuilder()
      .setName('reload')
      .setPublic()
      .using(this.manager.configs.commands.getSubsection("reload"), this.manager.lang)
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    this.manager.logger.info(`Reloading the bot...`);
    this.manager.services.interaction.registries.commands.clear()
    this.manager.services.interaction.registries.contextMenus.clear()
    this.manager.services.interaction.registries.buttons.clear()
    this.manager.services.interaction.registries.selectMenus.clear()
    this.manager.services.interaction.registries.modals.clear()
    await this.manager.services.interaction.initialize()
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
        await addon.registerInteractions()
      }))
    } catch (e) {
      error = e
    }

    this.logger.info(`Bot reloaded! Deploying commands...`);
    this.manager.services.interaction.deployCommands();

    if (error) {
      return interaction.reply(await this.manager.lang.buildMessage({
        key: 'messages.error-reloading',
        ephemeral: true,
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

    interaction.reply(await this.manager.lang.buildMessage({
      key: 'messages.reloaded',
      ephemeral: true,
      context: {
        user: user,
        guild: interaction.guild,
        channel: interaction.channel || undefined
      }
    }));
  }
}
