import inquirer from "inquirer";
import fg from "fast-glob";
import { Logger } from '../../../utils/logger.js';

import { updateFileToLanguages } from "../handlers/index.js";
import path from "node:path";

export default async function run() {
  const logger = new Logger("Translation");

  const files = await fg("src/addons/**/resources/lang/en-US.yml", { onlyFiles: true });
  files.push('src/core/resources/lang/en-US.yml');

  const { file } = await inquirer.prompt<{ file: string }>([
    { type: "list", name: "file", message: "Choose an asset type to update", choices: files.map(p => p.replace('/resources/lang/en-US.yml', '')) },
  ]);

  const folder = path.join(file, 'resources/lang/');
  const langs = await fg(`${folder}/*.yml`, {
    onlyFiles: true,
    ignore: [path.join(file, 'resources/lang/en-US.yml')],
  })

  const { targets } = await inquirer.prompt<{ targets: string[] }>([
    { type: "checkbox", name: "targets", message: "Choose languages", choices: langs.map(p => p.split("/").slice(-1)[0].replace('.yml', '')) },
  ]);

  if (!targets.length) {
    logger.warn?.("No languages selected.");
    return;
  }

  await updateFileToLanguages(path.join(folder, 'en-US.yml'), targets);
  logger.info(`Assets "${file}" updated for: ${targets.join(", ")}`);
}