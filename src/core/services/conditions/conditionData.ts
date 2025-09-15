import { Config, ActionData, Manager, Logger } from '@itsmybot';

export class ConditionData {
  public id: string;
  public logger: Logger;
  public filePath: string
  public notMetActions: ActionData[];
  public manager: Manager;
  public args: Config;

  constructor(manager: Manager, condition: Config, notMetAction: boolean = true) {
    this.filePath = `${condition.filePath} at ${condition.currentPath}`

    if (condition.has("expression")) {
      condition.set('id', "isExpressionTrue");
      condition.set('args.value', condition.getString("expression"));
    }

    this.id = condition.getString("id");

    if (this.id.startsWith('!')) {
      this.id = this.id.substring(1);
      condition.set("id", this.id);
      condition.set("args.inverse", true);
    }

    this.logger = new Logger(`Condition/${this.id}`);

    for (const [id, value] of condition.values) {
      const allowed = ['id', 'args', 'inverse', 'not-met-actions', 'expression'];
      if (!allowed.includes(id)) {
        condition.set(`args.${id}`, value);
        this.logWarning(`The "${id}" argument should be in the "args" section. Please move it there.`);
      }
      continue;
    }

    this.manager = manager;
    this.args = condition.getSubsectionOrNull("args") || condition.empty()
    this.notMetActions = notMetAction && condition.has("not-met-actions") ? condition.getSubsections("not-met-actions").map((actionData: Config) => new ActionData(this.manager, actionData, condition.logger)) : [];
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