import { Addon, ActionData } from '@itsmybot';
import { Base, Context, Variable } from '@contracts';

export abstract class Action<T extends Addon | undefined = undefined> extends Base<T>{
  abstract id: string;

  public trigger(script: ActionData, context: Context, variables: Variable[]) {
    const variablesCopy = [...variables];
    this.onTrigger(script, context, variablesCopy);
  }

  public abstract onTrigger(script: ActionData, context: Context, variables: Variable[]): any | void;

  public triggerActions(script: ActionData, context: Context, variables: Variable[]) {
    script.triggerActions.forEach(subAction => subAction.run(context, variables));
  }
}