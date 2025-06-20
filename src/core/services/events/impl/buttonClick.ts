import { Event, User, Context, Events } from '@itsmybot';
import { ButtonInteraction } from 'discord.js';

export default class ButtonClickEvent extends Event {
  name = Events.ButtonClick;

  async execute(interaction: ButtonInteraction<'cached'>, user: User) {
    if (!interaction.customId.startsWith("script_")) return;

    const context: Context = {
      guild: interaction.guild || undefined,
      member: interaction.member || undefined,
      user: user,
      channel: interaction.channel || undefined,
      content: interaction.customId,
      interaction: interaction,
      message: interaction.message,
    };

    this.manager.services.engine.event.emit('buttonClick', context);
  }
};