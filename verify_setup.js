const fs = require('fs');
console.log('Starting verification...');
try {
    const service = require('./src/projects/inventory/services/country.service.js');
    console.log('Service loaded successfully');
    fs.writeFileSync('status.txt', 'SUCCESS');
} catch (error) {
    fs.writeFileSync('status.txt', 'FAILED');
    fs.writeFileSync('err_code.txt', String(error.code));
    fs.writeFileSync('err_msg.txt', String(error.message));
}
