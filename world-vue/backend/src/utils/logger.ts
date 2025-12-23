import pino from 'pino';
import { config } from '../config/environment.js';

/**
 * Create a configured Pino logger instance
 * In development: pretty-printed output
 * In production: JSON output for log aggregation
 */
export const logger = pino({
  level: config.isProduction ? 'info' : 'debug',
  transport:
    config.isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context
 * @param context - Additional context to add to all log entries
 */
export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
