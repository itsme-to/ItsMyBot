import * as fs from 'fs';
import { Logger } from '../utils/logger/index.js';
import { input } from '@inquirer/prompts';


function makeAddon(name: string): any {
  const logger = new Logger("MakeAddon")
  logger.info(`Creating addon ${name}...`);

  const addonFolder = `src/addons/${name}`;
  const addonFile = `${addonFolder}/index.ts`;

  // Check if addon already exists
  if (fs.existsSync(addonFolder)) {
    logger.error(`Addon ${name} already exists.`);
    return askForAddonName();
  }

  // Create addon folder
  fs.mkdirSync(addonFolder);

  // Create addon file
  fs.writeFileSync(addonFile, `import { Addon } from '@itsmybot';

export default class ${name}Addon extends Addon {

  version = "0.0.1"
  authors = ["ItsMe.to"]
  description = "An example addon."

  async initialize() { }
}`);

  logger.info(`Addon ${name} created.`);

  return;
}

async function askForAddonName() {
  const answer = await input({ message: "What's the name of the addon?" });
  return makeAddon(answer);
}

await askForAddonName();
