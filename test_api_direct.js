const http = require('http');

const data = JSON.stringify({
    email: 'yashkr4748@gmail.com'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/forgot-password',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🚀 Testing API Direct (Bypassing Nginx/CORS)...');
console.log(`Payload: ${data}`);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();
