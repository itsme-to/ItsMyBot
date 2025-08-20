import { Addon, ActionData, Base, Context, Variable } from '@itsmybot';

export abstract class Action<T extends Addon | undefined = undefined> extends Base<T>{
  abstract id: string;

  public async trigger(script: ActionData, context: Context, variables: Variable[]) {
    const variablesCopy = [...variables];
    await this.onTrigger(script, context, variablesCopy);
  }

  public abstract onTrigger(script: ActionData, context: Context, variables: Variable[]): Promise<any>;

  public async triggerFollowUpActions(script: ActionData, context: Context, variables: Variable[]) {
    for (const subAction of script.followUpActions) {
      await subAction.run(context, variables);
    }
  }
}