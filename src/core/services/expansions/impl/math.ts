import { Expansion, Context, Utils } from '@itsmybot';

export default class MathExpansion extends Expansion {
  name = 'math';

  async onRequest(context: Context, placeholder: string) {
    try {
      const result = Utils.evaluateNumber(placeholder);
      return result?.toString();
    } catch (error) {
      this.logger.error("Error while calculating expression: " + error);
      return "Calculation error";
    }
  }
}