import { Event, User, Context, Events, Variable } from '@itsmybot';
import { AnySelectMenuInteraction } from 'discord.js';

export default class SelectMenuSubmitEvent extends Event {
  name = Events.SelectMenuSubmit;

  async execute(interaction: AnySelectMenuInteraction<'cached'>, user: User) {
    if (!interaction.customId.startsWith("script_")) return;

    const args: string[] = [];
    let customId = interaction.customId;

    if (interaction.customId.includes(':')) {
      const split = interaction.customId.match(/('.*?'|".*?"|[^:]+)+/g);
      if (split) {
        customId = split[0];
        args.push(...split.slice(1).map(arg => arg.replace(/^['"]|['"]$/g, '')));
      }
    }

    const context: Context = {
      guild: interaction.guild || undefined,
      member: interaction.member || undefined,
      user: user,
      channel: interaction.channel || undefined,
      content: customId,
      interaction: interaction,
      message: interaction.message,
    };

    const variables: Variable[] = [
      { name: 'select_menu_custom_id', value: customId },
      { name: 'select_menu_values_count', value: interaction.values.length },
      { name: 'select_menu_values', value: interaction.values.join(', ') },
      { name: 'select_menu_args_count', value: args.length },
      { name: 'select_menu_args', value: args.join(', ') }
    ];

    for (let i = 0; i < interaction.values.length; i++) {
      variables.push({ name: `select_menu_value_${i}`, value: interaction.values[i] });
    }

    for (let i = 0; i < args.length; i++) {
      variables.push({ name: `select_menu_arg_${i}`, value: args[i] });
    }

    this.manager.services.engine.event.emit('selectMenuSubmit', context, variables);
  }
};