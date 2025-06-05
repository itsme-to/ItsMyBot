import { Logger } from '@utils';
import { Config, ActionData, Manager } from '@itsmybot';

export class ConditionData {
  public id: string;
  public config: Config;
  public logger: Logger;
  public args: Config;
  public notMetActions: ActionData[];
  public manager: Manager;

  constructor(manager: Manager, condition: Config, notMetAction: boolean = true) {
    
    this.config = condition;
    if (!this.config.has("args")) this.config.set("args", this.config.empty('args'));
    if (this.config.has("expression")) {
      condition.set('id', "isExpressionTrue");
      this.config.set('args.value', this.config.getString("expression"));
    }

    this.id = condition.getString("id");

    if (this.id.startsWith('!')) {
      this.id = this.id.substring(1);
      this.config.set("id", this.id);
      this.config.set("args.inverse", true);
    }

    this.manager = manager;
    this.logger = new Logger(`Condition/${this.id}`);
    this.args = this.config.getSubsection("args");
    this.notMetActions = notMetAction && condition.has("not-met-actions") ? condition.getSubsections("not-met-actions").map((actionData: Config) => new ActionData(this.manager, actionData, condition.logger)) : [];
  }

  public logError(message: string) {
    this.logger.error(`${message} in ${this.config.filePath} at ${this.config.currentPath}`);
    return false;
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