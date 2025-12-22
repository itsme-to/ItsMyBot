import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import yaml from 'yaml';
import { TranslationWSClient } from './translationWSClient.js'; 

export const availableLangs = ['id', 'da', 'de', 'en-GB', 'en-US', 'es-ES', 'es-419', 'fr', 'hr', 'it', 'lt', 'hu', 'nl', 'no', 'pl', 'pt-BR', 'ro', 'sv-SE', 'vi', 'tr', 'cs', 'el', 'bg', 'ru', 'uk', 'hi', 'th', 'zh-CN', 'ja', 'zh-TW', 'ko'];


const wsClient = new TranslationWSClient(
  process.env.WS_URL || 'wss://translation.itsme.to',
  process.env.WS_SECRET || ''
);

export async function translateFileToLanguages(filePath: string, targetLangs: string[]) {
  let fileBuffer: Buffer;
  try {
    fileBuffer = await promisify(fs.readFile)(filePath);
  } catch (err) {
    console.error(`❌ Source file not found at ${filePath}`);
    return;
  }

  await Promise.all(targetLangs.map(async lang => {
    try {
      const translatedBuffer = await translateBufferToLanguage(filePath, fileBuffer, lang);
      if (!translatedBuffer) return;

      const outputPath = filePath.replace('en-US', lang);
      await promisify(fs.writeFile)(outputPath, translatedBuffer);
      console.log(`✅ Translated ${filePath} to ${lang} → ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error translating to ${lang}:`, error);
    }
  }));
}

export async function updateFileToLanguages(filePath: string, targetLangs: string[]) {
  let defaultBuffer: Buffer;
  try {
    defaultBuffer = await promisify(fs.readFile)(filePath);
  } catch {
    console.error(`❌ Default file not found at ${filePath}`);
    return;
  }

  const defaultDoc = yaml.parseDocument(defaultBuffer.toString());

  await Promise.all(targetLangs.map(async lang => {
    const langPath = filePath.replace('en-US', lang);
    let langDoc = new yaml.Document();

    try {
      const langBuffer = await promisify(fs.readFile)(langPath);
      langDoc = yaml.parseDocument(langBuffer.toString());
    } catch {
      console.warn(`⚠️ Language file not found at ${langPath}, will create a new one.`);
      langDoc = new yaml.Document({});
    }

    const missing = findMissingPaths(defaultDoc.toJSON(), langDoc.toJSON(), []);
    if (missing.length === 0) {
      console.log(`✅ No missing keys in ${langPath}`);
      return;
    }

    const missingData: any = {};
    for (const pathArr of missing) {
      const val = defaultDoc.getIn(pathArr);
      setDeepValue(missingData, pathArr, val);
    }

    const translatedBuffer = await translateBufferToLanguage(
      filePath,
      Buffer.from(yaml.stringify(missingData)),
      lang
    );

    if (!translatedBuffer) return;

    const translatedDoc = yaml.parseDocument(Buffer.from(translatedBuffer).toString());

    for (const pathArr of missing) {
      const translatedValue = translatedDoc.getIn(pathArr);
      langDoc.setIn(pathArr, translatedValue);
    }
    await fs.promises.writeFile(langPath, langDoc.toString({ lineWidth: -1 }));
    console.log(`✅ Updated ${filePath} for ${lang} → ${langPath}`);
  }))
}

async function translateBufferToLanguage(filePath: string, buffer: Buffer, lang: string) {
  const fileName = path.basename(filePath);
  try {
    const result = await wsClient.translateFile(fileName, buffer, lang);
    return result.buffer; 
  } catch (error) {
    console.error(`❌ Error translating to ${lang}:`, error);
  }
}
function findMissingPaths(source: any, target: any, currentPath: string[]): string[][] {
  const missing: string[][] = [];

  for (const key in source) {
    const newPath = [...currentPath, key];
    if (!(key in target)) {
      missing.push(newPath);
    } else if (typeof source[key] === 'object' && typeof target[key] === 'object') {
      missing.push(...findMissingPaths(source[key], target[key], newPath));
    }
  }

  return missing;
}

function setDeepValue(obj: any, path: string[], value: any) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!(path[i] in current)) current[path[i]] = {};
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
}