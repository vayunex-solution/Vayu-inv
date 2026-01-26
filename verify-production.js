const https = require('https');

const API_URL = 'https://inv-api.vayunexsolution.com';

const makeRequest = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false // Allow self-signed certs for testing
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: data
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runTests = async () => {
    console.log('🚀 Starting Production API Tests...\n');

    // Test 1: Health Check
    try {
        console.log('1. Testing Health Check (/health)...');
        const health = await makeRequest('/health');
        console.log('   Status:', health.status);
        console.log('   Response:', health.body.substring(0, 100)); // Limit output
        
        if (health.status === 200) {
             console.log('   ✅ Health Check Passed\n');
        } else {
             console.log('   ❌ Health Check Failed\n');
        }
    } catch (error) {
        console.log('   ❌ Connection Error:', error.message, '\n');
    }

    // Test 2: Login
    try {
        console.log('2. Testing Login (/api/v1/auth/login)...');
        // Trying valid credentials
        const login = await makeRequest('/api/v1/auth/login', 'POST', {
            email: 'yashkr4748@gmail.com',
            password: 'test123456' // Assuming this password or change if needed
        });
         
        // If 401, trying admin credentials
        if (login.status === 401) {
             console.log('   ⚠️ First login attempt failed (401). Trying admin credentials...');
             const adminLogin = await makeRequest('/api/v1/auth/login', 'POST', {
                 email: 'admin@gmail.com',
                 password: 'admin@1234'
             });
             console.log('   Status:', adminLogin.status);
             console.log('   Response:', adminLogin.body.substring(0, 100));
        } else {
             console.log('   Status:', login.status);
             console.log('   Response:', login.body.substring(0, 100));
        }
    } catch (error) {
        console.log('   ❌ Login Error:', error.message, '\n');
    }
};

runTests();
