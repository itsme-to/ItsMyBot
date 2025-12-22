import { Config, ActionData, Manager, Logger } from '@itsmybot';

export class ConditionData {
  public id: string;
  public logger: Logger;
  public filePath: string
  public notMetActions: ActionData[];
  public manager: Manager;
  public args: Config;

  constructor(manager: Manager, config: Config, notMetAction: boolean = true) {
    this.filePath = `${config.filePath} at ${config.currentPath}`
    this.manager = manager;

    if (config.has("expression")) {
      config.set('id', "isExpressionTrue");
      config.set('args.value', config.getString("expression"));
    }

    this.id = config.getString("id");

    if (this.id.startsWith('!')) {
      this.id = this.id.substring(1);
      config.set("id", this.id);
      config.set("args.inverse", true);
    }

    this.logger = new Logger(`Condition/${this.id}`);

    for (const [id, value] of config.values) {
      const allowed = ['id', 'args', 'inverse', 'not-met-actions', 'expression'];
      if (!allowed.includes(id)) {
        config.set(`args.${id}`, value);
        this.logWarning(`The "${id}" argument should be in the "args" section. Please move it there.`);
      }
      continue;
    }

    this.args = config.getSubsectionOrNull("args") || config.newConfig()
    this.notMetActions = notMetAction && config.has("not-met-actions") ? config.getSubsections("not-met-actions").map((actionData: Config) => new ActionData(this.manager, actionData, config.logger)) : [];
  }

  public logError(message: string) {
    this.logger.error(`${message} in ${this.filePath}`);
    return false;
  }

  public logWarning(message: string) {
    this.logger.warn(`${message} in ${this.filePath}`);
  }

  public missingArg(missing: string) {
    this.logError(`Missing required argument: "${missing}"`);
    return false;
  }

  public missingContext(missing: string) {
    this.logError(`Missing context: "${missing}"`);
    return false;
  }
}