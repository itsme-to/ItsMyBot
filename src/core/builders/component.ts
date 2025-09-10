import { Config, Cooldown } from '@itsmybot';

export class ComponentBuilder {
  cooldown: Cooldown = new Cooldown(0);
  public: boolean = false;
  conditions: Config[] = [];

  using(config: Config) {
    if (config.has("cooldown")) this.setCooldown(config.getNumber("cooldown"));
    this.conditions = config.getSubsectionsOrNull('conditions') || [];

    return this;
  }

  setCooldown(cooldown: number) {
    this.cooldown = new Cooldown(cooldown);
    return this;
  }

  setPublic() {
    this.public = true;
    return this;
  }
}
