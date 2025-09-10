import { Action, ActionArgumentsValidator, ActionData, Context, Variable, Utils } from '@itsmybot';
import { Role } from 'discord.js';
import { IsDefined, IsString } from 'class-validator';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true})
  value: string | string[]
}

export default class RemoveRoleAction extends Action {
  id = "removeRole";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const rolesToRemove = script.args.getStrings("value")
    
    if (!context.member) return script.missingContext("member", context);

    let roles = await Promise.all(
      rolesToRemove.map(async roleName =>
        Utils.findRole(await Utils.applyVariables(roleName, variables, context), context.guild)
      ));

    roles = roles.filter(Boolean);

    if (roles.length) {
      context.member.roles.remove(roles as Role[]);
    }
  }
}