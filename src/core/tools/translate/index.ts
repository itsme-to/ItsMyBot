
import { Logger } from '../../utils/logger.js';

import { select } from '@inquirer/prompts';
import translateFile from './commands/translateFile.js';
import updateFile from './commands/updateFile.js';
import addNewLanguage from './commands/addNewLanguage.js';

const actions = ["Translate File", "Update File", "Add a new Language"];

async function startCLI() {
  const logger = new Logger("Translation");
  
  while (true) {
    const answer = await select({
      message: "What do you want to do?",
      choices: actions.map((action) => ({ name: action, value: action }))
    });

    try {
      switch (answer) {
        case "Translate File": await translateFile(); break;
        case "Update File":    await updateFile(); break;
        case "Add a new Language": await addNewLanguage(); break;
      }
    } catch (err: any) {
      logger.error(err?.stack ?? String(err));
    }
  }
}


await startCLI();
