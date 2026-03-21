import { Action, ActionData, Context, Variable, Utils, ActionArgumentsValidatorWithModal } from '@itsmybot';

export default class ShowModalAction extends Action {
  id = "showModal";
  argumentsValidator = ActionArgumentsValidatorWithModal;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    if (!context.interaction || context.interaction.isModalSubmit()) return script.missingContext("interaction", context);

    const modal = await Utils.setupModal({ config: script.args, context, variables });
    await context.interaction.showModal(modal);
  }
}