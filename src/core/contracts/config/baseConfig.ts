import { Logger, Utils } from '@itsmybot';
import { Config } from './config.js';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import { parseDocument, Document } from 'yaml';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { getActionArgsChildErrors, getConditionArgsChildErrors } from '../decorators/validator.js';

export class BaseConfig extends Config {
  public update: boolean

  /** Id of the file, it's the relative path without the extension */
  public id: string
  private configFilePath: string;
  private defaultFilePath?: string;

  constructor(settings: { logger: Logger, configFilePath: string, defaultFilePath?: string, ConfigClass?: unknown, update?: boolean; id: string }) {
    super(settings.logger, settings.configFilePath);
    this.update = settings.update || false
    this.id = settings.id
    this.configFilePath = join(resolve(), settings.configFilePath);
    this.defaultFilePath = settings.defaultFilePath ? join(resolve(), settings.defaultFilePath) : undefined;
  }

  async initialize(configClass?: any) {
    if (this.defaultFilePath && !await Utils.fileExists(this.defaultFilePath)) {
      this.logger.warn(`Default file not found at ${this.defaultFilePath}`);
      return this;
    }

    if (!await Utils.fileExists(join(this.configFilePath))) {
      if (this.defaultFilePath) {
        await fs.mkdir(join(this.configFilePath, '..'), { recursive: true });
        await fs.copyFile(this.defaultFilePath, this.configFilePath);
      }
    } else {
      await this.replaceTabs();
    }
    await this.loadConfigs(configClass);
    return this;
  }

  async loadConfigs(configClass?: any) {
    const configContent = parseDocument(await fs.readFile(this.configFilePath, 'utf8'));
    let defaultContent 
    if (this.defaultFilePath) {
      defaultContent = parseDocument(await fs.readFile(this.defaultFilePath, 'utf8'));
    }

    await this.validate(configClass, configContent, defaultContent);
    this.init(configContent.toJS());
  }

  async validate(configClass: any, configContent: Document, defaultContent?: Document) {
    if (!configClass) return;
    const config = plainToInstance(configClass, configContent.toJS());

    if (!config) return this.handleValidationErrors(['Empty configuration file, please delete it or fill it with the values. If the error persists, contact the addon developer.']);

    const errors = await validate(config, { validationError: { target: false }, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true });
    const formattedErrors = [];

    if (errors.length > 0) {
      formattedErrors.push(...Utils.formatValidationErrors(errors, {
        isValidActionArgs: getActionArgsChildErrors,
        isValidConditionArgs: getConditionArgsChildErrors
      }));
    }

    if (defaultContent) {
      const corrected = this.correctWithDefaults(formattedErrors, configContent, defaultContent);
      if (corrected) {
        await fs.writeFile(this.configFilePath, configContent.toString(), 'utf8');
        return this.loadConfigs();
      }
    }

    this.handleValidationErrors(formattedErrors);
  }

  correctWithDefaults(errors: string[], configContent: Document, defaultContent: Document): boolean {
    let corrected = false;

    for (const error of errors) {
      const [path, errorMessage] = error.split(': ', 2);
      if (!errorMessage) continue;
      if (errorMessage.includes('should not be null or undefined')) {
        const pathArray = path.replace('-', '').trim().split('.');
        const defaultValue: unknown = defaultContent.getIn(pathArray, true);
        if (defaultValue !== null && defaultValue !== undefined) {
          this.logger.warn(`Using default value for '${path}': ${defaultValue}`);
          configContent.setIn(pathArray, defaultValue);
          corrected = true;
        }
      }
    }

    return corrected;
  }

  handleValidationErrors(errors: string[]) {
    if (errors.length === 0) return;
    throw [`Validation errors in the configuration file '${this.configFilePath}':`, ...errors]
  }

  private async replaceTabs() {
    const content = await fs.readFile(this.configFilePath, 'utf8');
    const updatedContent = content.replace(/\t/g, '  ');
    if (content !== updatedContent) {
      await fs.writeFile(this.configFilePath, updatedContent, 'utf8');
      this.logger.warn(`Tabulation replaced in ${this.configFilePath}, please use double spaces instead of tabs!`);
    }
  }
}