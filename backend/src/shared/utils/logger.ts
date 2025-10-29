import { LoggerService } from '@nestjs/common';
import chalk from 'chalk';

// Force chalk to use colors even in non-TTY environments
chalk.level = 3;

// Ensure colors work in all environments
if (process.env.FORCE_COLOR !== '0') {
  process.env.FORCE_COLOR = '3';
}

export class CustomLogger implements LoggerService {
  private readonly useTimestamp = true;
  private readonly defaultContext: string;

  constructor(context?: string) {
    this.defaultContext = context || 'Application';
  }

  log(message: string, context?: string) {
    this.print(chalk.green.bold('LOG'), message, context);
  }

  warn(message: string, context?: string) {
    this.print(chalk.yellow.bold('WARN'), message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.print(chalk.red.bold('ERROR'), message, context, true);
    if (trace) {
      process.stderr.write(chalk.red(trace) + '\n');
    }
  }

  debug(message: string, context?: string) {
    this.print(chalk.cyan.bold('DEBUG'), message, context);
  }

  verbose(message: string, context?: string) {
    this.print(chalk.magenta.bold('VERBOSE'), message, context);
  }

  success(message: string, context?: string) {
    this.print(chalk.green.bold('SUCCESS'), message, context);
  }

  /**
   * Log an info message with blue color
   */
  info(message: string, context?: string) {
    this.print(chalk.blue.bold('INFO'), message, context);
  }

  private print(
    level: string,
    message: string,
    context?: string,
    isError = false,
  ) {
    const timestamp = this.useTimestamp
      ? chalk.gray(`[${new Date().toISOString()}]`)
      : '';

    const finalContext = context || this.defaultContext;
    const ctx = chalk.blue(`[${finalContext}]`);

    const output = `${level} ${timestamp} ${ctx} ${message}\n`;

    if (isError) {
      process.stderr.write(output);
    } else {
      process.stdout.write(output);
    }
  }

  /**
   * Create a new logger instance with a specific context
   */
  static withContext(context: string): CustomLogger {
    return new CustomLogger(context);
  }
}
