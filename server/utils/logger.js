const { createLogger, format, transports } = require('winston');
require('winston-mongodb');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.MongoDB({
      level: 'info',
      db: process.env.DB_URL,
      options: { useUnifiedTopology: true },
      collection: 'logs',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      metaKey: 'meta'
    })
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.MongoDB({
      db: process.env.DB_URL,
      options: { useUnifiedTopology: true },
      collection: 'exceptions',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    })
  ],
  rejectionHandlers: [
    new transports.Console(),
    new transports.MongoDB({
      db: process.env.DB_URL,
      options: { useUnifiedTopology: true },
      collection: 'rejections',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    })
  ]
});

module.exports = logger;
