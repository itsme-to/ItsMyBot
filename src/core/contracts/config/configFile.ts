import { Logger, Utils } from '@itsmybot';
import { Config } from './config.js';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import { parseDocument, Document } from 'yaml';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { getActionArgsChildErrors, getConditionArgsChildErrors } from '../decorators/validator.js';

/**
 * Class representing a configuration file.
 */
export class ConfigFile extends Config {
  /** Relative path without the extension */
  public id: string;
  /** Absolute path to the config file */
  private absoluteFilePath: string;
  /** Absolute path to the default config file */
  private defaultFilePath?: string;

  constructor(logger: Logger, filePath: string, id: string, defaultFilePath?: string) {
    super(logger, filePath);
    this.id = id
    this.absoluteFilePath = join(resolve(), filePath);
    this.defaultFilePath = defaultFilePath ? join(resolve(), defaultFilePath) : undefined;
  }

  /**
   * Initialize the config file.
   * @param configClass The config class to use for initialization.
   * @return The initialized ConfigFile instance.
   */
  public async initialize(configClass?: any) {
    // Check if default file exists
    if (this.defaultFilePath) {
      if (!await Utils.fileExists(this.defaultFilePath)) {
        throw [`Default configuration file not found at ${this.defaultFilePath}`];
      } 
    }

    // Create config file if it doesn't exist and copy default file
    if (!await Utils.fileExists(this.absoluteFilePath)) {
      if (this.defaultFilePath) {
        await fs.mkdir(join(this.absoluteFilePath, '..'), { recursive: true });
        await fs.copyFile(this.defaultFilePath, this.absoluteFilePath);
      } else {
        throw [`Configuration file not found at ${this.absoluteFilePath} and no default file provided.`];
      }
    }

    await this.loadFile(configClass);
    return this;
  }

  /**
   * Load the configuration file.
   * @param configClass The config class to use for validation and initialization.
   */
  private async loadFile(configClass?: any) {
    const configDocument = parseDocument(await fs.readFile(this.absoluteFilePath, 'utf8'));
    let defaultDocument
    if (this.defaultFilePath) {
      defaultDocument = parseDocument(await fs.readFile(this.defaultFilePath, 'utf8'));
    }

    // Validate the config file against the provided class
    await this.validateConfig(configClass, configDocument, defaultDocument);

    // Initialize the config with the loaded values
    this.init(configDocument.toJS());
  }

  /**
   * Validate the configuration file against the provided class.
   * @param configClass The config class to use for validation.
   * @param configDocument The config document to validate.
   * @param defaultDocument The default document to use for validation.
   */
  private async validateConfig(configClass: any, configDocument: Document, defaultDocument?: Document) {
    if (!configClass) return

    // Transform the plain object to an instance of the config class
    const config = plainToInstance(configClass, configDocument.toJS());
    if (!config) throw [`The configuration file '${this.absoluteFilePath}' is empty, please delete it or fill it with the values. If the error persists, contact the addon developer.`];

    // Validate the config instance
    const errors = await validate(config, { validationError: { target: false }, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true });

    const formattedErrors = [];
    if (errors.length > 0) {
      // Format validation errors
      formattedErrors.push(...Utils.formatValidationErrors(errors, {
        isValidActionArgs: getActionArgsChildErrors,
        isValidConditionArgs: getConditionArgsChildErrors
      }));

      // Attempt to correct errors using default values
      if (defaultDocument) {
        const corrected = this.correctWithDefaults(formattedErrors, configDocument, defaultDocument);
        if (corrected) {
          await fs.writeFile(this.absoluteFilePath, configDocument.toString(), 'utf8');
          return this.loadFile();
        }
      }
      
      throw [`Validation errors in the configuration file '${this.absoluteFilePath}':`, ...formattedErrors]
    }
  }

  /**
   * Attempt to correct validation errors using default values.
   * @param errors The list of validation error messages.
   * @param configDocument The config document to correct.
   * @param defaultDocument The default document to use for corrections.
   * @return True if any corrections were made, false otherwise.
   */
  private correctWithDefaults(errors: string[], configDocument: Document, defaultDocument: Document): boolean {
    let corrected = false;

    // Iterate over errors and attempt to correct them
    for (const error of errors) {

      // Extract the path and error message from the error string
      const [path, errorMessage] = error.split(': ', 2);
      if (!errorMessage) continue;

      // If the error indicates a missing required property, attempt to set it from the default document
      if (errorMessage.includes('should not be null or undefined')) {
        // Convert path to array format for YAML document access
        const pathArray = path.replace('-', '').trim().split('.');
        const defaultValue: unknown = defaultDocument.getIn(pathArray, true);

        // If a default value exists, set it in the config document
        if (defaultValue !== null && defaultValue !== undefined) {
          this.logger.warn(`Using default value for '${path}': ${defaultValue}`);
          configDocument.setIn(pathArray, defaultValue);
          corrected = true;
        }
      }
    }

    return corrected;
  }
}