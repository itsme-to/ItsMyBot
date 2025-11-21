import ExampleAddon from '..';
import { User, Button } from '@itsmybot';
import { ButtonInteraction } from 'discord.js';

export default class ExampleButton extends Button<ExampleAddon> {
  customId = 'example_id';
  usingPermissionFrom = 'helloWorld'; // Use the same permission as the 'helloWorld' command

  async execute(interaction: ButtonInteraction<'cached'>, user: User) {
    
  }
}