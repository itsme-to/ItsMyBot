import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class AnyOfCondition extends Condition {
  id = "anyOf";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const conditionsConfig = condition.config.getSubsectionsOrNull("conditions");
    if (!conditionsConfig) return condition.missingArg("conditions");

    const conditions = this.manager.services.condition.buildConditions(conditionsConfig, false);

    const isMet = await Promise.all(conditions.map(condition => this.manager.services.condition.isConditionMet(condition, context, variables)))
    return isMet.some(result => result);
  }
}