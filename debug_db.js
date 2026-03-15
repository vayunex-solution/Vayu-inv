const { testConnection } = require('./src/core/database');
const fs = require('fs');

testConnection()
  .then(() => {
    fs.writeFileSync('test_error.json', JSON.stringify({ success: true }));
    process.exit(0);
  })
  .catch(err => {
    fs.writeFileSync('test_error.json', JSON.stringify({ success: false, message: err.message, stack: err.stack }));
    process.exit(1);
  });
