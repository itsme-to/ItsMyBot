import { Cooldown } from '@utils';
import Utils from '@utils';
import { Config } from '@itsmybot';

export class ComponentBuilder {
  cooldown: Cooldown = new Cooldown(0);
  requiredRoles: string[] = [];
  requiredChannels: string[] = [];
  requiredUsers: string[] = [];
  inherited: boolean = true;
  permissions: bigint[] = [];
  public: boolean = false;

  using(config: Config) {
    if (config.has("cooldown")) this.setCooldown(config.getNumber("cooldown"));
    if (config.has("permissions")) this.setPermissions(config.getStrings("permissions"));
    if (config.has("roles")) this.setRequiredRoles(config.getStrings("roles"));
    if (config.has("channels")) this.setRequiredChannels(config.getStrings("channels"));
    if (config.has("users")) this.setRequiredUsers(config.getStrings("users"));
    if (config.has("inherited") === false) this.setInherited(false);

    return this;
  }

  setInherited(inherited: boolean) {
    this.inherited = inherited;
    return this;
  }

  setCooldown(cooldown: number) {
    this.cooldown = new Cooldown(cooldown);
    return this;
  }

  setRequiredRoles(roles: string[]) {
    this.requiredRoles = roles;
    return this;
  }

  setRequiredChannels(channels: string[]) {
    this.requiredChannels = channels;
    return this;
  }

  setRequiredUsers(users: string[]) {
    this.requiredUsers = users;
    return this;
  }

  setPermissions(permissions: string[]) {
    for (const permission of permissions) {
      const flag = Utils.getPermissionFlags(permission);
      if (flag) this.permissions.push(flag);
    }
    return this;
  }

  setPublic() {
    this.public = true;
    return this;
  }
}
