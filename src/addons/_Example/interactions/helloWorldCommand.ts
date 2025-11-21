import { Command, User, CommandBuilder } from '@itsmybot';
import ExampleAddon from '..';
import { AutocompleteInteraction, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

export default class HelloWorldCommand extends Command<ExampleAddon> {

  build() {
    return new CommandBuilder()
      .setName('commission')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setPublic()
      .addSubcommand(subcommand =>
        subcommand
          .setName('create')
          .addStringOption(option =>
            option
              .setName('name')
              .setRequired(true))
          .addNumberOption(option =>
            option
              .setName('price')
              .setRequired(true))
          .addStringOption(option =>
            option
              .setName('deadline')
              .setAutocomplete(true)
              .setRequired(true))
          .addStringOption(option =>
            option
              .setName('type')
              .setRequired(true)
              .addChoices(
                { name: 'Survival', value: 'survival' },
                { name: 'Mine', value: 'mine' },
                { name: 'Spawn', value: 'spawn' },
                { name: 'Arena/Arcade', value: 'arena' },
                { name: 'Faction', value: 'faction' },
                { name: 'Roleplay', value: 'roleplay' },
                { name: 'Remake', value: 'remake' },
                { name: 'Other', value: 'other' }
              ))
          .addStringOption(option =>
            option
              .setName('version')
              .setRequired(true)
              .addChoices(
                { name: '1.7', value: '1.7' },
                { name: '1.8', value: '1.8' },
                { name: '1.9', value: '1.9' },
                { name: '1.1O', value: '1.10' },
                { name: '1.11', value: '1.11' },
                { name: '1.12', value: '1.12' },
                { name: '1.13', value: '1.13' },
                { name: '1.14', value: '1.14' },
                { name: '1.15', value: '1.15' },
                { name: '1.16', value: '1.16' },
                { name: '1.17', value: '1.17' },
                { name: '1.18', value: '1.18' },
                { name: '1.19', value: '1.19' },
                { name: '1.20', value: '1.20' },
                { name: '1.21', value: '1.21' }
              ))
      );
  }

  async autocomplete(interaction: AutocompleteInteraction) {
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
  }
}