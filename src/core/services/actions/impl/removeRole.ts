import { Action, ActionData, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import { Role } from 'discord.js';

export default class RemoveRoleAction extends Action {
  id = "removeRole";

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const rolesToRemove = script.args.getStringsOrNull("value")

    if (!context.member) return script.missingContext("member", context);
    if (!rolesToRemove) return script.missingArg("value", context);

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