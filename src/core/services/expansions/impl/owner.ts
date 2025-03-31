import { Expansion, Context } from '@itsmybot';
import Utils from '@utils';

export default class OwnerExpansion extends Expansion {
  name = 'owner';

  async onRequest(context: Context, placeholder: string) {

    if (!context.guild) return "No guild found";
    const owner = await context.guild.fetchOwner()
    const ownerUser = await this.manager.services.user.findOrCreate(owner);

    return Utils.applyVariables(`%owner_${placeholder}%`, Utils.userVariables(ownerUser, 'owner'));
  }
}