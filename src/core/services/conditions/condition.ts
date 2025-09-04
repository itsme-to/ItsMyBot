import { Addon, ConditionData, Base, Context, Variable, ConditionArgumentValidator } from '@itsmybot';

export abstract class Condition<T extends Addon | undefined = undefined> extends Base<T> {
  abstract id: string;
  argumentsValidator = ConditionArgumentValidator;

  abstract isMet(condition: ConditionData, context: Context, variables: Variable[]): Promise<boolean> | boolean
}