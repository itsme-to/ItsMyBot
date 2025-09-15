import { Action, ActionData, Context, ActionArgumentsValidator, Variable, Utils } from '@itsmybot';
import { IsDefined, IsString } from 'class-validator';
import { Role } from 'discord.js';

class ArgumentsValidator extends ActionArgumentsValidator {
  @IsDefined()
  @IsString({ each: true})
  value: string | string[]
}

export default class AddRoleAction extends Action {
  id = "addRole";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const rolesToAdd = script.args.getStrings("value")

    if (!context.member) return script.missingContext("member", context);
    if (!context.guild) return script.missingContext("guild", context);

    let roles = await Promise.all(
      rolesToAdd.map(async roleName =>
        Utils.findRole(await Utils.applyVariables(roleName, variables, context), context.guild)
      ));

    roles = roles.filter(Boolean);
    
    if (roles.length) {
      await context.member.roles.add(roles as Role[]);
    }
  }
}