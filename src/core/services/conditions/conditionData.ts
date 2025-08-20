import { Logger } from '@utils';
import { Config, ActionData, Manager } from '@itsmybot';

export class ConditionData {
  public id: string;
  public config: Config;
  public logger: Logger;
  public notMetActions: ActionData[];
  public manager: Manager;

  constructor(manager: Manager, condition: Config, notMetAction: boolean = true) {
    this.config = condition;

    if (this.config.has("expression")) {
      condition.set('id', "isExpressionTrue");
      this.id = "isExpressionTrue";
      this.logger = new Logger(`Condition/${this.id}`);
      this.config.set('value', this.config.getString("expression"));
      this.logWarning(`The "expression" argument is deprecated. Please use "value" instead with the id "isExpressionTrue"`);
    }

    this.id = condition.getString("id");

    if (this.id.startsWith('!')) {
      this.id = this.id.substring(1);
      this.config.set("id", this.id);
      this.config.set("inverse", true);
    }

    this.logger = new Logger(`Condition/${this.id}`);

    if (this.config.has("args")) {
      this.logWarning(`The "args" section is deprecated. Please put everything in the main condition object.`);
      for (const [id, arg] of this.config.getSubsection("args").values) {
        this.config.set(id, arg);
      }
    }

    this.manager = manager;
    this.notMetActions = notMetAction && condition.has("not-met-actions") ? condition.getSubsections("not-met-actions").map((actionData: Config) => new ActionData(this.manager, actionData, condition.logger)) : [];
  }

  public logError(message: string) {
    this.logger.error(`${message} in ${this.config.filePath} at ${this.config.currentPath}`);
    return false;
  }

  public logWarning(message: string) {
    this.logger.warn(`${message} in ${this.config.filePath} at ${this.config.currentPath}`);
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