import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Create different formats for different environments
const developmentFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  errors({ stack: true }),
  simple()
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Determine format based on environment
const logFormat = process.env.NODE_ENV === 'production' 
  ? productionFormat 
  : developmentFormat;

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: logFormat
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: combine(
      timestamp(),
      errors({ stack: true }),
      json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: combine(
      timestamp(),
      errors({ stack: true }),
      json()
    )
  })
];

// Create logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
  exitOnError: false
});

// Stream object for Morgan HTTP logging
export const stream = {
  write: (message) => logger.http(message.trim())
};

export default logger; 