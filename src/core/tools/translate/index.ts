
import { Logger } from '../../utils/logger.js';

import inquirer from 'inquirer';
import translateFile from './commands/translateFile.js';
import updateFile from './commands/updateFile.js';
import addNewLanguage from './commands/addNewLanguage.js';

const actions = ["Translate File", "Update File", "Add a new Language"];
type Action = typeof actions[number];

async function startCLI() {
  const logger = new Logger("Translation");
  
  while (true) {
    const { action } = await inquirer.prompt<{ action: Action }>([
      { type: "list", name: "action", message: "What do you want to do?", choices: actions },
    ]);

    try {
      switch (action) {
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
