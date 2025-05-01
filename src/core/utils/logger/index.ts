import chalk from 'chalk';
import * as fs from 'fs';
import { stdout } from 'process';
import logManager from './logManager.js';

export class Logger {
  prefix: string;
  logFile: fs.WriteStream;

  constructor(prefix: string = "ItsMyBot") {
    this.prefix = prefix;
    this.logFile = fs.createWriteStream('./logs/latest.log', { flags: 'a' });
  }

  private getCurrentTimestamp() {
    return new Date().toLocaleTimeString();
  }

  public warn(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#FADD05")("[WARN]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
    logManager.log(message);
  }

  public error(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const messageParts: string[] = [];
  
    for (const item of text) {
      if (item instanceof Error) {
        messageParts.push(item.message);
        if ('errors' in item) {
          messageParts.push('Validation errors:\n' + JSON.stringify((item as any).errors, null, 2));
        }
      
        if ('cause' in item) {
          messageParts.push('Cause:\n' + JSON.stringify((item as any).cause, null, 2));
        }
      
        if (item.stack) {
          messageParts.push(item.stack);
        }
      } else {
        messageParts.push(item);
      }
    }
  
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#FF380B")("[ERROR]"))}: [${this.prefix}] ${messageParts.join('\n')}`;
  
    stdout.write(message + '\n');
    logManager.log(message);
  }

  public empty(...text: any[]) {
    const message = text.join(' ');

    stdout.write(message + '\n');
    logManager.log(message);
  }

  public info(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#61FF73")("[INFO]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
    logManager.log(message);
  }

  public debug(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#17D5F7")("[DEBUG]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
    logManager.log(message);
  }
}
