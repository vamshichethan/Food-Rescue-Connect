const { createLogger, format, transports } = require('winston');
const path = require('path');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'food-rescue-connect-api' },
  transports: [
    // Write all errors to error.log
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    // Write all logs to combined.log
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
    }),
  ],
});

// If not in production, log to the console with beautiful, colored format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            // Print stack trace if available
            return `[${timestamp}] ${level}: ${message}\n${stack}`;
          }
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    })
  );
}

module.exports = logger;
