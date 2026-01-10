/**
 * Core Module Index
 * Central export for all core functionality
 */

// Configuration
const { config, validateConfig } = require('./config');

// Database
const database = require('./database');

// Authentication
const auth = require('./auth');

// Exceptions
const exceptions = require('./exceptions');

// Logger
const logger = require('./logger');

// Utilities
const utils = require('./utils');

module.exports = {
    // Configuration
    config,
    validateConfig,

    // Database
    ...database,

    // Auth
    ...auth,

    // Exceptions
    ...exceptions,

    // Logger
    logger,

    // Utils
    ...utils
};
