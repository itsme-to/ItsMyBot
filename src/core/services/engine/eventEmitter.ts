import { Context, Variable } from '@itsmybot';
import { EventEmitter } from 'events';

type Listener = (context: Context, variable: Variable[]) => void;

export default class EngineEventEmitter extends EventEmitter {
  on(event: string, listener: Listener) {
    return super.on(event, listener);
  }

  off(event: string, listener: Listener) {
    return super.off(event, listener);
  }

  emit(event: string, context: Context, variables: Variable[] = []) {
    return super.emit(event, context, variables);
  }
}