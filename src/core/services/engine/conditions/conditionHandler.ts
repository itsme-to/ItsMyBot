import { Collection } from 'discord.js';
import { ActionScript, Manager, Script, Condition, CustomCommand } from '@itsmybot';
import { Context, Variable } from '@contracts';
import { ScriptCondition } from '../actionScript.js';

import { AboveMembersCondition } from './impl/aboveMembers.js';
import { BellowMembersCondition } from './impl/bellowMembers.js';
import { ContentCondition } from './impl/content.js';
import { ContentContainsCondition } from './impl/contentContains.js';
import { IsBotCondition } from './impl/isBot.js';

export class ConditionHandler {
  manager: Manager;
  conditions: Collection<string, Condition>;

  constructor(manager: Manager) {
    this.manager = manager;
    this.conditions = new Collection();
  }

  registerCondition(id: string, condition: Condition) {
    if (this.conditions.has(id)) return condition.logger.warn(`Condition ${id} is already registered`);

    this.conditions.set(id, condition);
  }

  async isConditionMet(conditionData: ScriptCondition, script: ActionScript | Script | CustomCommand, context: Context, variables: Variable[]) {
    const condition = this.conditions.get(conditionData.id);
    if (!condition) {
      this.manager.logger.warn(`No condition found for ID: ${conditionData.id}`);
      return false;
    }

    const conditionParameters = condition.parameters().filter(param => !(param in context));
    for (const param of conditionParameters) {
      this.manager.logger.error(`${conditionData.id} need the parameter '${param}'`);
      return false;
    }

    const conditionArguments = condition.arguments().filter(argument => !conditionData.args.has(`${argument}`));
    for (const argument of conditionArguments) {
      this.manager.logger.error(`${conditionData.id} need the argument '${argument}'`);
      return false;
    }

    let isMet = condition.isMet(script, context, conditionData.args);

    console.log(isMet);

    if (conditionData.args.getBoolOrNull("inverse")) {
      isMet = !isMet;
    }

    console.log(isMet);

    if (!isMet) {
      conditionData.notMetActions.forEach(subAction => subAction.run(context, variables));
    }

    return isMet;
  }

  initialize() {
    this.registerCondition("aboveMembers", new AboveMembersCondition(this.manager));
    this.registerCondition("bellowMembers", new BellowMembersCondition(this.manager));
    this.registerCondition("content", new ContentCondition(this.manager));
    this.registerCondition("contentContains", new ContentContainsCondition(this.manager));
    this.registerCondition("isBot", new IsBotCondition(this.manager));
  }
}