/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { setupSwagger } = require('./swagger');
const { notFoundHandler, globalErrorHandler } = require('./core/exceptions');
const logger = require('./core/logger');

// Create Express app
const app = express();

/**
 * Security Middleware
 */
app.use(helmet({
    contentSecurityPolicy: false // Disable for Swagger UI compatibility
}));

/**
 * CORS Configuration
 */
app.use(cors({
    origin: '*', // Configure as needed for production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 */
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });

    next();
});

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * API Version Info
 */
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Vaynex Inventory API',
        version: '1.0.0',
        documentation: '/api-docs',
        timestamp: new Date().toISOString()
    });
});

/**
 * Setup Swagger Documentation
 */
setupSwagger(app);

/**
 * Register Project Routes
 */
const registerRoutes = () => {
    // Auth routes (public)
    const authRoutes = require('./projects/auth/routes/auth.routes');
    app.use('/api/v1/auth', authRoutes);

    // Inventory routes (protected)
    const itemRoutes = require('./projects/inventory/routes/item.routes');
    app.use('/api/v1/inventory', itemRoutes);

    const countryRoutes = require('./projects/inventory/routes/country.routes');
    app.use('/api/v1/inventory/countries', countryRoutes);

    logger.info('Routes registered successfully');
};

// Register routes
registerRoutes();

/**
 * 404 Handler - Must be after all routes
 */
app.use(notFoundHandler);

/**
 * Global Error Handler - Must be last
 */
app.use(globalErrorHandler);

module.exports = app;
