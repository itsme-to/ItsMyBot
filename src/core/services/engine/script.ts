import { ActionData, BaseScript, Context, Variable } from '@itsmybot';
import { Collection } from 'discord.js';

export class Script extends BaseScript {
  triggers = new Collection<string, ActionData[]>();

  loadTriggers() {
    for (const action of this.actions) {
      for (const trigger of action.triggers || []) {
        if (!this.triggers.has(trigger)) this.triggers.set(trigger, []);
        this.triggers.get(trigger)?.push(action);
      }
    }

    for (const [trigger, actions] of this.triggers) {
      this.manager.services.engine.event.on(trigger, async (context: Context, variables: Variable[]) => {
        if (!await this.meetsConditions(context, [])) return;

        for (const action of actions) {
          await action.run(context, variables);
        }
      })
    }
  }
}