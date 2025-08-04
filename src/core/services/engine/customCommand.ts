import { BaseScript, Context, Variable } from '@itsmybot';

export class CustomCommand extends BaseScript {

  async run(context: Context, variables: Variable[]) {
    if (!await this.meetsConditions(context, variables)) return;

    for (const action of this.actions) {
      await action.run(context, variables);
    }
  }
}