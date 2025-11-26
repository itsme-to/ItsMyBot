
import inquirer from "inquirer";
import fg from "fast-glob";
import { availableLangs, translateFileToLanguages } from "../handlers/index.js";
import { Logger } from '../../../utils/logger.js';


export default async function run() {
  const logger = new Logger("Translation");

  const { lang } = await inquirer.prompt<{ lang: string }>([
    { type: "list", name: "lang", message: "Select the new language to add", choices: availableLangs },
  ]);

  const newLang = lang.toLowerCase();

  const files = await fg("src/addons/**/resources/lang/en-US.yml", { onlyFiles: true });
  files.push('src/core/resources/lang/en-US.yml');

  await Promise.all(files.map(file => translateFileToLanguages(file, [newLang])));

  logger.info(`New language "${newLang}" added and translated.`);
}