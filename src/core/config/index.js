/**
 * Core Configuration Module
 * Loads and exports environment configuration with type validation
 */
require('dotenv').config();

const config = {
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT, 10) || 3000,
        env: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production'
    },

    // Database Configuration
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
        waitForConnections: true,
        queueLimit: 0
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log'
    }
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
    const requiredDbFields = ['host', 'user', 'password', 'database'];
    const missingFields = requiredDbFields.filter(field => !config.database[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required database configuration: ${missingFields.join(', ')}`);
    }

    if (!config.jwt.secret) {
        throw new Error('JWT_SECRET is required in environment configuration');
    }

    return true;
};

module.exports = { config, validateConfig };
