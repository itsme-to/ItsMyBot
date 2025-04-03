import { Expansion, Context } from '@itsmybot';
import { Parser } from 'expr-eval'

export default class MathExpansion extends Expansion {
  name = 'math';

  async onRequest(context: Context, placeholder: string) {
    try {
      const result = Parser.evaluate(placeholder);
      return result.toString();
    } catch (error) {
      this.logger.error("Error while calculating expression: " + error);
      return "Calculation error";
    }
  }
}