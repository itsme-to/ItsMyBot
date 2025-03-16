import { Logger } from '@utils';
import Utils from '@utils';
import * as fs from 'fs/promises';
import { parseDocument } from 'yaml';

export class Config {
  public values: Map<string, any>;
  public logger: Logger;
  public currentPath: string | undefined;
  public filePath: string | undefined

  constructor(logger: Logger, filePath: string | undefined = undefined, currentPath: string | undefined  = undefined) {
    this.values = new Map();
    this.logger = logger;
    this.currentPath = currentPath;
    this.filePath = filePath;
  }

  public init(values: unknown) {
    this.values.clear();

    const normalizedValues = this.normalizeToConfig(values);
    for (const [key, value] of normalizedValues) {
      this.values.set(key, value);
    }
  }

  public has(path: string): boolean {
    return this.getOrNull(path) !== undefined;
  }

  public empty() {
    return new Config(this.logger, this.filePath, this.currentPath);
  }

  private getOrNull(path: string): unknown {
    const nearestPath = path.split('.')[0];

    if (path.includes('.')) {
      const remainingPath = path.substring(nearestPath.length + 1);
      if (!remainingPath) return undefined;

      const first = this.getOrNull(nearestPath);
      return first instanceof Config ? first.getOrNull(remainingPath) : undefined;
    }

    return this.values.get(nearestPath);
  }

  private get(path: string): unknown {
    const value = this.getOrNull(path);
    if (value === null || value === undefined) {
      const totalPath = this.getPath(path);
      throw this.logger.error(`No config value found for "${totalPath}"` + (this.filePath ? ` in file ${this.filePath}` : ""));
    }
    return value;
  }

  public getString(path: string, randomize: boolean = false): string {
    const value = this.get(path);
    if (TypeCheckers.isString(value)) return value;

    if (TypeCheckers.isStringArray(value) && randomize) {
      return Utils.getRandom(value)
    }

    throw this.logger.error(`Expected string at path "${path}"`);
  }

  public getStringOrNull(path: string, randomize: boolean = false): string | undefined {
    const value = this.getOrNull(path);
    
    if (value === null || value === undefined) return undefined;
    if (TypeCheckers.isString(value)) return value

    if (TypeCheckers.isStringArray(value) && randomize) {
      return Utils.getRandom(value)
    }

    return undefined;
  }

  public getStrings(path: string): string[] {
    const value = this.get(path);

    if (TypeCheckers.isStringArray(value)) return value
    if (TypeCheckers.isString(value)) return [value]

    throw this.logger.error(`Expected string array at path "${path}"`);
  }

  public getStringsOrNull(path: string): string[] | undefined {
    const value = this.getOrNull(path);

    if (value === null || value === undefined) return undefined;
    if (TypeCheckers.isStringArray(value)) return value
    if (TypeCheckers.isString(value)) return [value]

    return undefined;
  }

  public getBool(path: string): boolean {
    const value = this.get(path);

    if (TypeCheckers.isBoolean(value)) return value

    throw this.logger.error(`Expected boolean at path "${path}"`);
  }

  public getBoolOrNull(path: string): boolean | undefined {
    const value = this.getOrNull(path);

    if (value === null || value === undefined) return undefined;
    if (TypeCheckers.isBoolean(value)) return value

    return undefined;
  }

  public getNumber(path: string, randomize: boolean = false): number {
    const value = this.get(path);

    if (TypeCheckers.isNumber(value)) return value

    if (TypeCheckers.isNumberArray(value) && randomize) {
      return Utils.getRandom(value);
    }

    throw this.logger.error(`Expected number at path "${path}"`);
  }

  public getNumberOrNull(path: string, randomize: boolean = false): number | undefined {
    const value = this.getOrNull(path);

    if (value === null || value === undefined) return undefined;
    if (TypeCheckers.isNumber(value)) return value

    if (TypeCheckers.isNumberArray(value) && randomize) {
      return Utils.getRandom(value);
    }

    return undefined;
  }

  public getNumbers(path: string): number[] {
    const value = this.get(path);

    if (TypeCheckers.isNumberArray(value)) return value
    if (TypeCheckers.isNumber(value)) return [value]

    throw this.logger.error(`Expected number array at path "${path}"`);
  }

  public getNumbersOrNull(path: string): number[] | undefined {
    const value = this.getOrNull(path);

    if (value === null || value === undefined) return undefined;
    if (TypeCheckers.isNumberArray(value)) return value
    if (TypeCheckers.isNumber(value)) return [value]

    return undefined;
  }

  public getSubsection(path: string, randomize: boolean = false): Config {
    const value = this.get(path);

    if (TypeCheckers.isConfig(value)) return value

    if (TypeCheckers.isConfigArray(value) && randomize) {
      return Utils.getRandom(value);
    }

    throw this.logger.error(`Expected subsection at path "${path}"`);
  }

  public getSubsectionOrNull(path: string, randomize: boolean = false): Config | undefined {
    const value = this.getOrNull(path);

    if (value === null || value === undefined) return undefined;
    if (TypeCheckers.isConfig(value)) return value

    if (TypeCheckers.isConfigArray(value) && randomize) {
      return Utils.getRandom(value);
    }

    return undefined;
  }

  public getSubsections(path: string): Config[] {
    const value = this.get(path);

    if (TypeCheckers.isConfigArray(value)) return value
    if (TypeCheckers.isConfig(value)) return [value]

    throw this.logger.error(`Expected subsection array at path "${path}"`);
  }

  public getSubsectionsOrNull(path: string): Config[] | undefined {
    const value = this.getOrNull(path);

    if (value === null || value === undefined) return undefined;
    if (TypeCheckers.isConfigArray(value)) return value
    if (TypeCheckers.isConfig(value)) return [value]

    return undefined;
  }

  public set(path: string, obj: unknown) {
    const pathParts = path.split('.');
    const nearestPath = pathParts[0];
    const updatedPath = this.currentPath ? `${this.currentPath}.${nearestPath}` : nearestPath;

    if (path.includes('.')) {
      const remainingPath = path.substring(nearestPath.length + 1);

      const section = this.getOrNull(nearestPath) as Config || new Config(this.logger, this.filePath, updatedPath);
      section.set(remainingPath, obj);
      this.values.set(updatedPath, section);
      return;
    }

    if (obj === null) {
      this.values.delete(updatedPath);
    } else {
      this.values.set(updatedPath, obj);
    }
  }

  public async setFileContent(path: string, obj: unknown) {
    if (!this.filePath) return false;

    const file = parseDocument(await fs.readFile(this.filePath, 'utf8'));
    const fullPath = this.getPath(path);

    const pathSegments = fullPath.split('.').reduce((acc, segment) => {
        const match = segment.match(/([^[\]]+)|(\d+)/g);
        if (match) acc.push(...match);
        return acc;
    }, [] as (string | number)[]);

    file.setIn(pathSegments.map(seg => (isNaN(Number(seg)) ? seg : Number(seg))), obj);
    this.set(path, obj);
    await fs.writeFile(this.filePath, file.toString(), 'utf8');

    return true;
}
    

  private normalizeToConfig(obj: unknown): Map<string, any> {
    const normalized = new Map();

    for (const [key, value] of Object.entries(obj as { [key: string]: unknown })) {
      if (key == null || value == null) continue;

      const stringKey = key.toString();
      normalized.set(stringKey, this.constrainConfigTypes(value, stringKey));
    }

    return normalized;
  }

  private constrainConfigTypes(value: unknown, path: string = '') {
    const updatedPath = this.currentPath ? `${this.currentPath}.${path}` : path;

    if (Array.isArray(value)) {
      if (!value.length) return [];
      return value.map((item, index) => {
        if (typeof item === 'object') {
          const config = new Config(this.logger, this.filePath, `${updatedPath}[${index}]`);
          config.init(item);
          return config;
        } else {
          return item;
        }
      });
    }

    if (typeof value === 'object') {
      const config = new Config(this.logger, this.filePath, updatedPath);
      config.init(value);
      return config;
    }

    if (typeof value === 'number' && !Number.isInteger(value)) {
      return value.toFixed(2);
    }

    return value;
  }

  public toPlaintext(): string {
    return JSON.stringify(Object.fromEntries(this.values));
  }

  public toJSON() {
    const obj: { [key: string]: unknown } = {};
    for (const [key, value] of this.values) {
      if (value instanceof Config) {
        obj[key] = value.toJSON();
      } else {
        obj[key] = value;
      }
    }
    return obj;
  }

  private getPath(path: string): string {
    return this.currentPath ? `${this.currentPath}.${path}` : path;
  }
}

class TypeCheckers {
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  static isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => this.isString(item));
  }

  static isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  static isNumberArray(value: unknown): value is number[] {
    return Array.isArray(value) && value.every(item => this.isNumber(item));
  }

  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  static isConfig(value: unknown): value is Config {
    return value instanceof Config;
  }

  static isConfigArray(value: unknown): value is Config[] {
    return Array.isArray(value) && value.every(item => this.isConfig(item));
  }
}

