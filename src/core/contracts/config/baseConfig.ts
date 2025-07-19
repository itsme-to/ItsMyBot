import { Logger } from '@utils';
import Utils from '@utils';
import { Config } from './config.js';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import { parseDocument, Document } from 'yaml';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export class BaseConfig extends Config {
  public update: boolean

  /** Id of the file, it's the relative path without the extension */
  public id: string

  private configContent: Document
  private defaultContent: Document

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
    this.configContent = parseDocument(await fs.readFile(this.configFilePath, 'utf8'));
    if (this.defaultFilePath) {
      this.defaultContent = parseDocument(await fs.readFile(this.defaultFilePath, 'utf8'));
    }

    await this.validate(configClass);
    this.init(this.configContent.toJS());
  }

  async validate(configClass?: any) {
    if (!configClass) return;
    const config = plainToInstance(configClass, this.configContent.toJS());

    if (!config) return this.handleValidationErrors(['Empty configuration file, please delete it or fill it with the values. If the error persists, contact the addon developer.']);

    const errors = await validate(config, { validationError: { target: false }, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true });

    const formattedErrors = formatValidationErrors(errors);

    if (this.defaultContent) {
      const corrected = await this.correctWithDefaults(formattedErrors);
      if (corrected) {
        await fs.writeFile(this.configFilePath, this.configContent.toString(), 'utf8');
        return this.loadConfigs();
      }
    }

    this.handleValidationErrors(formattedErrors);
  }
  
  async correctWithDefaults(errors: string[]): Promise<boolean> {
    let corrected = false;

    for (const error of errors) {
      const [path, errorMessage] = error.split(': ', 2);
      if (errorMessage.includes('should not be null or undefined')) {
        const pathArray = path.split('.');
        const defaultValue: unknown = this.defaultContent.getIn(pathArray, true);
        if (defaultValue !== null && defaultValue !== undefined) {
          this.logger.warn(`Using default value for '${path}': ${defaultValue}`);
          this.configContent.setIn(pathArray, defaultValue);
          corrected = true;
        }
      }
    }

    return corrected;
  }

  handleValidationErrors(errors: string[]) {
    if (errors.length === 0) return;
    throw [`Validation errors in the configuration file '${this.configFilePath}':`, ...errors.map(error => `- ${error}`)]
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

function formatValidationErrors(errors: ValidationError[], parentPath?: string): string[] {
  const messages: string[] = [];
  errors.forEach(error => {
    const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property;
    if (error.constraints) {
      const errorMessages = Object.values(error.constraints).map(msg => `${propertyPath}: ${msg}`);
      messages.push(...errorMessages);
    }
    if (error.children && error.children.length > 0) {
      const childMessages = formatValidationErrors(error.children, propertyPath);
      messages.push(...childMessages);
    }
  });
  return messages;
}
