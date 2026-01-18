
try {
    console.log('Attempting to require logger...');
    const logger = require('./src/core/logger');
    console.log('Logger loaded');
    logger.info('Test log message');
} catch (error) {
    console.error('Error in script:', error);
    console.error(error.stack);
}
