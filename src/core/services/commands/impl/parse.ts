import Utils from '@utils';
import { CommandBuilder } from '@builders';
import { Command, User } from '@itsmybot';
import { Context, CommandInteraction } from '@contracts';
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

  async execute(interaction: CommandInteraction, user: User) {
    const target = interaction.options.getMember("user")
    const targetUser = target ? await this.manager.services.user.findOrCreate(target) : user;

    const context: Context = {
      user: targetUser,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined
    }

    const text = await Utils.applyVariables(interaction.options.getString("text", true), [], context);

    interaction.reply(await Utils.setupMessage({
      config: this.manager.configs.lang.getSubsection("parsed"),
      variables: [
        { searchFor: "%parsed_text%", replaceWith: text },
      ],
      context: context,
    }))
  }
}
