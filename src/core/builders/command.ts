import { ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js';
import { ComponentBuilder } from '@builders';
import Utils from '@utils';
import { Config } from '@itsmybot';
import { Mixin } from 'ts-mixer';

export class CommandBuilder extends Mixin(SlashCommandBuilder, ComponentBuilder) {
  aliases: string[] = [];
  enabled: boolean = true;

  public using(config: Config) {
    super.using(config);
    
    if (config.has("description")) this.setDescription(config.getString("description"));
    if (config.has("permission")) this.setDefaultMemberPermissions(Utils.permissionFlags(config.getString("permission")));
    if (config.has("aliases")) this.setAliases(config.getStrings("aliases"));
    if (config.getBoolOrNull("enabled") === false) this.setEnabled(false);

    return this;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }

  public setAliases(aliases: string[]) {
    this.aliases = aliases;
    return this;
  }
}

export class ContextMenuBuilder extends Mixin(ContextMenuCommandBuilder, ComponentBuilder) {
  enabled: boolean;

  public using(config: Config) {
    super.using(config);

    if (config.has("permission")) {
      this.setDefaultMemberPermissions(Utils.permissionFlags(config.getString("permission")));
    }
    if (config.getBoolOrNull("enabled") === false) this.setEnabled(false);

    return this;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }
}
