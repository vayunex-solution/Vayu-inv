
try {
    console.log('Requiring winston...');
    const winston = require('winston');
    console.log('Winston loaded successfully');
} catch (error) {
    console.error('Error requiring winston:', error);
    console.error(error.stack);
}
