/**
 * Application Entry Point
 * Initializes database connection and starts the server
 */
const { config, validateConfig } = require('./src/core/config');
const { testConnection, closePool } = require('./src/core/database');
const logger = require('./src/core/logger');

/**
 * Bootstrap Application
 * 1. Validate configuration
 * 2. Test database connection
 * 3. Start HTTP server
 */
const bootstrap = async () => {
    try {
        logger.info('='.repeat(50));
        logger.info('Starting Vaynex Inventory API...');
        logger.info('='.repeat(50));

        // Step 1: Validate configuration
        logger.info('Validating configuration...');
        validateConfig();
        logger.info('Configuration validated successfully');

        // Step 2: Test database connection (REQUIRED before serving requests)
        logger.info('Connecting to MySQL database...');
        await testConnection();

        // Step 3: Load Express app (after DB is confirmed)
        const app = require('./src/app');

        // Step 4: Start HTTP server
        const server = app.listen(config.server.port, () => {
            logger.info('='.repeat(50));
            logger.info(`Server running on port ${config.server.port}`);
            logger.info(`Environment: ${config.server.env}`);
            logger.info(`API Documentation: http://localhost:${config.server.port}/api-docs`);
            logger.info(`Health Check: http://localhost:${config.server.port}/health`);
            logger.info('='.repeat(50));
        });

        // Graceful shutdown handling
        const shutdown = async (signal) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await closePool();
                    logger.info('Database connections closed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown:', error.message);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', reason);
        });

    } catch (error) {
        // CRITICAL: If database connection fails, stop bootstrapping
        logger.error('='.repeat(50));
        logger.error('BOOTSTRAP FAILED');
        logger.error(error.message);
        logger.error('='.repeat(50));
        logger.error('Application cannot start. Please check your configuration.');
        process.exit(1);
    }
};

// Start the application
bootstrap();
