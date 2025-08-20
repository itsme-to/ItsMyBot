import { Condition, ConditionData, Context, Variable } from '@itsmybot';

export default class AtLeastOfCondition extends Condition {
  id = "atLeastOf";

  async isMet(condition: ConditionData, context: Context, variables: Variable[]) {
    const conditionsConfig = condition.config.getSubsectionsOrNull("conditions");
    if (!conditionsConfig) return condition.missingArg("conditions");
    const amount = condition.config.getNumberOrNull("amount");
    if (!amount || amount < 1) return condition.missingArg("amount");

    const conditions = this.manager.services.condition.buildConditions(conditionsConfig, false);

    const isMet = await Promise.all(conditions.map(condition => this.manager.services.condition.isConditionMet(condition, context, variables)))
    return isMet.filter(result => result).length >= amount;
  }
}