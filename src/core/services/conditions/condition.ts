import { Addon, ConditionData } from '@itsmybot';
import { Base, Context, Variable } from '@contracts';

export abstract class Condition<T extends Addon | undefined = undefined> extends Base<T> {
  abstract id: string;

  abstract isMet(condition: ConditionData, context: Context, variables: Variable[]): Promise<boolean> | boolean
}