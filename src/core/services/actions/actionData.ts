import { Logger } from '@utils';
import { Config, BaseScript, Manager, Context, Variable } from '@itsmybot';
import Utils from '@utils';
import manager from '@itsmybot';

export class ActionData extends BaseScript {
  public id?: string;
  public args: Config;
  private filePath: string;
  public triggers?: string[];
  public mutators?: Config;
  public followUpActions: ActionData[];
  public executionCounter: number = 0;
  public lastExecutionTime: number = 0;

  constructor(manager: Manager, data: Config, logger: Logger, ) {
    super(manager, data, logger);
    this.id = data.getStringOrNull("id");
    this.filePath = data.filePath || "unknown";
    this.args = data.getSubsectionOrNull("args") || data.empty();
    this.triggers = data.getStringsOrNull("triggers");
    this.mutators = data.getSubsectionOrNull("mutators");
    this.followUpActions = data.has("args.follow-up-actions") ? data.getSubsections("args.follow-up-actions").map((actionData: Config) => new ActionData(manager, actionData, logger)) : [];

    if (data.has('args.actions')) {
      this.logger.warn(`args.actions is deprecated, use args.follow-up-actions instead. in ${this.filePath}`);
      this.followUpActions = data.getSubsections('args.actions').map((actionData: Config) => new ActionData(manager, actionData, logger));
    }
  }

  async run(context: Context, variables: Variable[] = []) {
    const newVariables = [...variables];
    const newContext = { ...context };

    if (!await this.shouldExecute(newContext, newVariables)) return;

    const updatedContext = await this.applyMutators(newContext, newVariables)

    if (this.args.has("delay")) {
      setTimeout(async () => await this.executeActions(updatedContext, newVariables), this.args.getNumber("delay") * 1000)
    } else {
      await this.executeActions(updatedContext, newVariables);
    }
  }

  async executeActions(context: Context, variables: Variable[]) {
    if (this.actions.length > 0) {
      for (const subAction of this.actions) {
        await subAction.run(context, variables);
      }
    } else {
      await this.manager.services.action.triggerAction(this, context, variables);
    }

    this.lastExecutionTime = Date.now();
  }

  async applyMutators(context: Context, variables: Variable[]) {
    if (!this.mutators) return context;

    for (const [mutator, value] of this.mutators.values) {
      const parsedValue = await Utils.applyVariables(value.toString(), variables, context);

      switch (mutator) {
        case "content":
          context.content = parsedValue
          break; 

        case "member":
          const newMember = await context.member?.guild.members.fetch(parsedValue)
          if (!newMember) continue

          const newUserMember = await this.manager.services.user.findOrCreate(newMember)
          context.user = newUserMember
          context.member = newMember
          break;

        case 'user':
          const newUser = await this.manager.services.user.findOrNull(parsedValue)
          if (!newUser) continue

          context.user = newUser
          break;
        
        case 'channel':
          const newChannel = await Utils.findChannel(parsedValue, context.guild)
          if (!newChannel) continue

          context.channel = newChannel
          break;

        case 'message':
          if (!context.channel || !context.channel.isSendable()) continue
          const newMessage = await context.channel.messages.fetch(parsedValue).catch(() => null)
          if (!newMessage) continue

          context.message = newMessage
          break;
        
        case 'guild':
          const newGuild = await this.manager.client.guilds.fetch(parsedValue)
          if (!newGuild) continue

          context.guild = newGuild
          break;
        
        case 'role':
          const newRole = await Utils.findRole(parsedValue, context.guild)
          if (!newRole) continue

          context.role = newRole
          break;
      }
    }

    return context
  }


  async shouldExecute(context: Context, variables: Variable[]) {
    const meetsConditions = await this.meetsConditions(context, variables);
    if (!meetsConditions) return false;

    this.executionCounter++;

    if (this.args.has("every") && this.executionCounter % this.args.getNumber("every") !== 0) return false;
    if (this.args.has("cooldown") && this.lastExecutionTime && (Date.now() - this.lastExecutionTime) < this.args.getNumber("cooldown") * 1000) return false;
    if (this.args.has("chance") && Math.floor(Math.random() * 100) + 1 > this.args.getNumber("chance")) return false;

    return true;
  }

  public logError(message: string) {
    this.logger.error(`${message} in ${this.filePath}`);
  }

  public async missingArg(missing: string, context: Context) {
    this.logError(`Missing required argument: "${missing}"`);

    const message = await Utils.setupMessage({
      config: manager.configs.lang.getSubsection("engine.missing-context"),
      context,
      variables: [
        { searchFor: "%missing%", replaceWith: missing },
        { searchFor: "%script%", replaceWith: this.id }
      ]
    });

    if (context.interaction) {
      context.interaction.reply(message);
    } else if (context.message) {
      context.message.reply(message);
    }
  }

  public async missingContext(missing: string, context: Context) {
    this.logError(`Missing context: "${missing}"`);

    const message = await Utils.setupMessage({
      config: manager.configs.lang.getSubsection("engine.missing-argument"),
      context,
      variables: [
        { searchFor: "%missing%", replaceWith: missing },
        { searchFor: "%script%", replaceWith: this.id }
      ]
    });

    if (context.interaction) {
      context.interaction.reply(message);
    } else if (context.message) {
      context.message.reply(message);
    }
  }
}