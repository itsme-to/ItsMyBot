import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { Role } from 'discord.js';

export default class AddRoleAction extends Action {
  id = "addRole";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const rolesToAdd = script.args.getStringsOrNull("value")

    if (!context.member) return script.missingContext("member", context);
    if (!context.guild) return script.missingContext("guild", context);
    if (!rolesToAdd) return script.missingArg("value", context);

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