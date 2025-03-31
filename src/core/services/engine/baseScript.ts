import { Logger } from '@utils';
import { Config, ActionData, ConditionData, Manager, Context, Variable } from '@itsmybot';

export class BaseScript {
  data: Config;
  conditions: ConditionData[];
  actions: ActionData[];
  logger: Logger;
  manager: Manager;

  constructor(manager: Manager, data: Config, logger: Logger, ) {
    this.logger = logger;
    this.manager = manager
    this.data = data;
    this.conditions = data.has("conditions") ? manager.services.condition.buildConditions(data.getSubsections("conditions")) : [];
    this.actions = data.has("actions") ? data.getSubsections("actions").map((actionData: Config) => new ActionData(manager, actionData, logger, )) : [];
  }

  async meetsConditions(context: Context, variables: Variable[]): Promise<boolean> {
    return this.manager.services.condition.meetsConditions(this.conditions, context, variables);
  }
}