import { Collection } from 'discord.js';
import { Manager, Expansion, Addon, Context, Service } from '@itsmybot';
import { sync } from 'glob';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Service to manage expansions in the bot.
 * Expansions are used to add custom placeholders to the bot.
 */
export default class ExpansionService extends Service{
  expansions: Collection<string, Expansion<Addon | undefined>>;

  constructor(manager: Manager) {
    super(manager);
    this.expansions = new Collection();
  }

  async initialize() {
    this.manager.logger.info("Placeholder expansions services initialized.");
    await this.registerFromDir(join(dirname(fileURLToPath(import.meta.url)), 'impl'))
  }

  async registerFromDir(expansionsDir: string, addon: Addon | undefined = undefined) {
    const expansionFiles = sync(join(expansionsDir, '**', '*.js').replace(/\\/g, '/'));

    for (const filePath of expansionFiles) {
      const expansionPath = new URL('file://' + filePath.replace(/\\/g, '/')).href;
      const { default: expansion } = await import(expansionPath);

      this.registerExpansion(new expansion(this.manager, addon));
    };
  }

  registerExpansion(expansion: Expansion<Addon | undefined>) {
    if (this.expansions.has(expansion.name)) {
      return this.manager.logger.error(`An expansion with the identifier ${expansion.name} is already registered.`);
    }
    this.expansions.set(expansion.name, expansion);
  }

  unregisterExpansion(identifier: string) {
    this.expansions.delete(identifier);
  }

  unregisterByAddon(addon: Addon) {
    for (const [name, expansion] of this.expansions) {
      if (expansion.addon === addon) {
        this.expansions.delete(name);
      }
    }
  }

  async resolvePlaceholders(text: string, context: Context = {}) {
    const matches = [...text.matchAll(/%([^%_]+)_(.*?)%/g)];

    for (const match of matches) {
      const [fullMatch, identifier, placeholder] = match;

      const expansion = this.expansions.get(identifier);
      if (expansion) {
        const resolvedPlaceholder = await this.resolveNestedPlaceholders(placeholder, context);
        const replacement = await expansion.onRequest(context, resolvedPlaceholder);
        if (replacement === undefined) continue;
        text = text.replace(fullMatch, replacement);
      }
    }

    return text;
  }

  async resolveNestedPlaceholders(placeholder: string, context: Context) {
    const nestedMatches = [...placeholder.matchAll(/\{(.*?)_(.*?)\}/g)];

    for (const nestedMatch of nestedMatches) {
      const [fullNestedMatch, nestedIdentifier, nestedPlaceholder] = nestedMatch;

      const nestedExpansion = this.expansions.get(nestedIdentifier);
      if (nestedExpansion) {
        const nestedReplacement = await nestedExpansion.onRequest(context, nestedPlaceholder);
        if (nestedReplacement === undefined) continue;
        return placeholder.replace(fullNestedMatch, nestedReplacement);
      }
    }

    return placeholder;
  }
}