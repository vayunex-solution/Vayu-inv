const fs = require('fs');
const path = require('path');

function log(msg) {
    console.log('[DEBUG]', msg);
    fs.appendFileSync('debug_output.log', '[DEBUG] ' + msg + '\n');
}

function testRequire(name, p) {
    try {
        log(`Attempting to require: ${name} (${p})`);
        const m = require(p);
        log(`SUCCESS: ${name}`);
        return m;
    } catch (e) {
        log(`FAILURE: ${name}`);
        log(`Error: ${e.message}`);
        log(`Stack: ${e.stack}`);
        if (e.code) log(`Code: ${e.code}`);
        return null;
    }
}

log('Starting granular checks...');

// 1. Check sequelize
if (!testRequire('sequelize (package)', 'sequelize')) {
    log('CRITICAL: sequelize package missing or broken');
    process.exit(1);
}

// 2. Check dotenv (used in core config)
if (!testRequire('dotenv (package)', 'dotenv')) {
    log('CRITICAL: dotenv package missing or broken');
    process.exit(1);
}

// 3. Check core config
const coreConfigPath = './src/core/config/index.js'; // Relative to CWD
if (!testRequire('Core Config', coreConfigPath)) {
    log('CRITICAL: src/core/config/index.js failed to load');
    process.exit(1);
}

// 4. Check db.config
const dbConfigPath = './src/config/db.config.js';
if (!testRequire('DB Config', dbConfigPath)) {
    log('CRITICAL: src/config/db.config.js failed to load');
    process.exit(1);
}

// 5. Check Country Model
const countryModelPath = './src/projects/inventory/models/country.model.js';
if (!testRequire('Country Model', countryModelPath)) {
    log('CRITICAL: Country model failed to load');
    process.exit(1);
}

// 6. Check Country Service
const countryServicePath = './src/projects/inventory/services/country.service.js';
if (!testRequire('Country Service', countryServicePath)) {
    log('CRITICAL: Country service failed to load');
    process.exit(1);
}

log('All checks passed!');
