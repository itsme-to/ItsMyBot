import { ComponentBuilder } from '@builders';
import TicketsAddon from '..';
import { User, Component } from '@itsmybot';
import { ButtonInteraction } from 'discord.js';

export default class ExampleButton extends Component<TicketsAddon> {
  customId = 'example_id';

  build() {
    return new ComponentBuilder() // Can use the same command as the slash command usefull to keep the same permissions and requirements
      .using(this.addon.configs.commands.getSubsection("example")) 
  }

  async execute(interaction: ButtonInteraction<'cached'>, user: User) {
    
  }
}