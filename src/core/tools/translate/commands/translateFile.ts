import { select, checkbox } from "@inquirer/prompts";
import fg from "fast-glob";
import { Logger } from '../../../utils/logger.js';

import { translateFileToLanguages } from "../handlers/index.js";
import path from "node:path";

export default async function run() {
  const logger = new Logger("Translation");

  const files = await fg("src/addons/**/resources/lang/en-US.yml", { onlyFiles: true });
  files.push('src/core/resources/lang/en-US.yml');

  const answer = await select({
    message: "Choose an asset type to translate",
    choices: files.map(p => p.replace('/resources/lang/en-US.yml', ''))
  });

  const folder = path.join(answer, 'resources/lang/');
  const langs = await fg(`${folder}/*.yml`, {
    onlyFiles: true,
    ignore: [path.join(answer, 'resources/lang/en-US.yml')],
  })

  const answers = await checkbox({
    message: "Choose languages",
    choices: langs.map(p => p.split("/").slice(-1)[0].replace('.yml', ''))
  });

  if (!answers.length) {
    logger.warn?.("No languages selected.");
    return;
  }

  await translateFileToLanguages(path.join(folder, 'en-US.yml'), answers);
  logger.info(`File "${answer}" translated to: ${answers.join(", ")}`);
}