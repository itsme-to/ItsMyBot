import chalk from 'chalk';
import { stdout } from 'process';

export class Logger {
  prefix: string;

  constructor(prefix: string = "ItsMyBot") {
    this.prefix = prefix;
  }

  private getCurrentTimestamp() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  public warn(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#FADD05")("[WARN]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
  }

  public error(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const messageParts: string[] = [];
  
    for (const item of text) {
      if (item instanceof Error) {
        if (item.stack) {
          messageParts.push(item.stack);
        } else {
          messageParts.push(item.message);
        }

        if ('errors' in item) {
          messageParts.push('Validation errors:\n' + JSON.stringify((item as any).errors, null, 2));
        }
      
        if ('cause' in item) {
          messageParts.push('Cause:\n' + JSON.stringify((item as any).cause, null, 2));
        }
      } else if (Array.isArray(item)) {
        messageParts.push(...item);
      } else {
        messageParts.push(item);
      }
    }
  
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#FF380B")("[ERROR]"))}: [${this.prefix}] ${messageParts.join('\n')}`;
  
    stdout.write(message + '\n');
  }

  public empty(...text: any[]) {
    const message = text.join(' ');

    stdout.write(message + '\n');
  }

  public info(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#61FF73")("[INFO]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
  }

  public debug(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#17D5F7")("[DEBUG]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
  }
}
