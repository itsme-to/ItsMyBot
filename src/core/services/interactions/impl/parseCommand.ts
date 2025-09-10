import { Command, User, CommandBuilder, Utils } from '@itsmybot';
import { ChatInputCommandInteraction } from 'discord.js';
export default class ParseCommand extends Command {

  build() {
    const command = this.manager.configs.commands.getSubsection("parse");

    return new CommandBuilder()
      .setName('parse')
      .using(command)
      .addStringOption(option =>
        option.setName("text")
          .setDescription(command.getString("options.text"))
          .setRequired(true))
      .addUserOption(option =>
        option.setName("user")
          .setDescription(command.getString("options.user"))
          .setRequired(false))
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const target = interaction.options.getMember("user")
    const targetUser = target ? await this.manager.services.user.findOrCreate(target) : user;

    interaction.reply(await Utils.setupMessage({
      config: this.manager.configs.lang.getSubsection("parsed"),
      variables: [
        { searchFor: "%parsed_text%", replaceWith: interaction.options.getString("text", true) },
      ],
      context: {
        user: targetUser,
        guild: interaction.guild || undefined,
        channel: interaction.channel || undefined
      },
    }))
  }
}
