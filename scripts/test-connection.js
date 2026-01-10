/**
 * Database Connection Test Script
 * Run: npm run test:connection
 */
require('dotenv').config();

const { config, validateConfig } = require('../src/core/config');
const { testConnection, closePool } = require('../src/core/database');
const logger = require('../src/core/logger');

const testDatabaseConnection = async () => {
    console.log('='.repeat(50));
    console.log('Database Connection Test');
    console.log('='.repeat(50));

    try {
        // Validate configuration
        console.log('Validating configuration...');
        validateConfig();
        console.log('Configuration validated successfully');

        console.log('\nDatabase Configuration:');
        console.log(`  Host: ${config.database.host}`);
        console.log(`  Port: ${config.database.port}`);
        console.log(`  Database: ${config.database.database}`);
        console.log(`  User: ${config.database.user}`);

        // Test connection
        console.log('\nAttempting to connect...');
        await testConnection();

        console.log('\n' + '='.repeat(50));
        console.log('SUCCESS: Database connection established!');
        console.log('='.repeat(50));

        // Clean up
        await closePool();
        process.exit(0);

    } catch (error) {
        console.error('\n' + '='.repeat(50));
        console.error('FAILED: Could not connect to database');
        console.error('='.repeat(50));
        console.error('Error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\nPossible causes:');
            console.error('  - MySQL server is not running');
            console.error('  - Incorrect host or port');
            console.error('  - Firewall blocking connection');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\nPossible causes:');
            console.error('  - Incorrect username or password');
            console.error('  - User does not have access to database');
        }

        process.exit(1);
    }
};

testDatabaseConnection();
