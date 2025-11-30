const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    // eslint-disable-next-line no-console
    console.log('Development environment: Loading .env file');
  } catch {}
} else {
  // eslint-disable-next-line no-console
  console.log('Production environment: Using Render environment variables');
}

// Initialize Sentry for error monitoring (before other imports)
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      Sentry.mongooseIntegration(),
    ],
    // Performance monitoring
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  // eslint-disable-next-line no-console
  console.log('Sentry initialized for error monitoring');
}

const app = require('./app');
const config = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
config.connectDB();

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Error: ${err.message}`);
  // Capture error in Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  // Capture error in Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  process.exit(1);
});
