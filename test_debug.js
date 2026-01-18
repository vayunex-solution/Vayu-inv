const fs = require('fs');

console.log('CWD:', process.cwd());
console.log('Checking sequelize...');
try {
    const s = require('sequelize');
    console.log('Sequelize loaded:', typeof s);
} catch (e) {
    console.error('Sequelize load failed:', e.code, e.message);
}

console.log('Checking db.config.js...');
try {
    const db = require('./src/config/db.config.js');
    console.log('db.config loaded');
} catch (e) {
    console.error('db.config load failed:', e.code, e.message);
}
