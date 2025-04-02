import { Addon, ConditionData, Base, Context, Variable } from '@itsmybot';

export abstract class Condition<T extends Addon | undefined = undefined> extends Base<T> {
  abstract id: string;

  abstract isMet(condition: ConditionData, context: Context, variables: Variable[]): Promise<boolean> | boolean
}