import { Event, User, Context, Events, Variable } from '@itsmybot';
import { ComponentType, ModalSubmitInteraction } from 'discord.js';

export default class ModalSubmitEvent extends Event {
  name = Events.ModalSubmit;

  async execute(interaction: ModalSubmitInteraction<'cached'>, user: User) {
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
    };

    const variables: Variable[] = [
      { name: 'modal_custom_id', value: customId },
      { name: 'modal_args_count', value: args.length },
      { name: 'modal_args', value: args.join(', ') }
    ];

    for (let i = 0; i < args.length; i++) {
      variables.push({ name: `modal_arg_${i}`, value: args[i] });
    }

    for (const modalComponent of interaction.components) {
      if (modalComponent.type === ComponentType.Label) {
        const component = modalComponent.component;

        switch (component.type) {
          case ComponentType.TextInput:
            variables.push({ name: `modal_text_input_${component.customId}`, value: component.value });
            break;
          case ComponentType.StringSelect:
            variables.push(
              { name: `modal_select_${component.customId}_values_count`, value: component.values.length },
              { name: `modal_select_${component.customId}_values`,value: component.values.join(', ') },
            );

            for (let i = 0; i < component.values.length; i++) {
              variables.push({ name: `modal_select_${component.customId}_value_${i}`, value: component.values[i] });
            }

            break;
          case ComponentType.FileUpload:
            variables.push({ name: `modal_file_upload_${component.customId}_attachments_count`, value: component.attachments.size });

            let index = 0;

            component.attachments.forEach(attachment => {
              variables.push({ name: `modal_file_upload_${component.customId}_attachment_${index}`, value: attachment.url });
              index++;
            });

            break;
        }
      }
    }

    this.manager.services.engine.event.emit('modalSubmit', context, variables);
  }
};