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
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'https://inventory.vayunexsolution.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

    const countryRoutes = require('./projects/inventory/controllers/country.controller');
    app.use('/api/v1/inventory/countries', countryRoutes);

    // Admin routes (protected)
    const menuRoutes = require('./projects/admin/controllers/menu.controller');
    app.use('/api/v1/admin/menus', menuRoutes);

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
