import { Collection } from 'discord.js';
import { Action, ActionData, Manager, Addon } from '@itsmybot';
import { Context, Service, Variable } from '@contracts';
import { sync } from 'glob';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Service to manage actions in the bot.
 * Actions are used to perform actions in the bot with the scripting system in the engine.
 */
export default class ActionService extends Service{
  actions: Collection<string, Action<Addon | undefined>>;

  constructor(manager: Manager) {
    super(manager);
    this.actions = new Collection();

  }

  async initialize() {
    await this.registerFromDir(join(dirname(fileURLToPath(import.meta.url)), 'impl'))
    this.manager.logger.info("Action service initialized.");
  }

  async registerFromDir(actionsDir: string, addon: Addon | undefined = undefined) {
    const actionFiles = sync(join(actionsDir, '**', '*.js').replace(/\\/g, '/'));

    for (const filePath of actionFiles) {
      const actionPath = new URL('file://' + filePath.replace(/\\/g, '/')).href;
      const { default: action } = await import(actionPath);

      this.registerAction(new action(this.manager, addon));
    };
  }

  registerAction(action: Action<Addon | undefined>) {
    if (this.actions.has(action.id)) return action.logger.warn(`Action ${action.id} is already registered`);

    this.actions.set(action.id, action);
  }

  async triggerAction(script: ActionData, context: Context, variables: Variable[] = []) {
    if (!script.id) return script.logger.error("No action ID found in script");

    const actionInstance = this.actions.get(script.id);
    if (!actionInstance) return script.logger.warn(`No action found for ID: ${script.id}`);

    actionInstance.trigger(script, context, variables);
  }
}