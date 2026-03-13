const http = require('http');

// Configuration
const CONFIG = {
    hostname: 'localhost',
    port: 3000,
    credentials: {
        email: 'admin@yahoo.com',
        password: 'admin123'
    }
};

// Helper: Make HTTP Request
const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: CONFIG.hostname,
            port: CONFIG.port,
            path: '/api/v1' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(body);
        }
        req.end();
    });
};

// Main Test Flow
(async () => {
    try {
        console.log('🚀 Starting Inventory API Test...\n');

        // 1. Login
        console.log('1️⃣  Authenticating...');
        const loginPayload = JSON.stringify(CONFIG.credentials);
        const loginRes = await request('POST', '/auth/login', loginPayload);

        if (loginRes.status !== 200 || !loginRes.data.accessToken) {
            console.error('❌ Login Failed:', loginRes.data);
            process.exit(1);
        }

        const token = loginRes.data.accessToken;
        console.log('✅ Login Success! Token acquired.\n');

        // 2. Fetch Countries
        console.log('2️⃣  Fetching Countries...');
        const countryRes = await request('GET', '/inventory/countries', null, token);
        console.log(`Status: ${countryRes.status}`);
        if(countryRes.status === 200) {
            console.log('✅ Countries Data Example:', JSON.stringify(countryRes.data.data?.[0] || countryRes.data, null, 2));
        } else {
            console.error('❌ Failed to fetch countries:', countryRes.data);
        }
        console.log('');

        // 3. Fetch Items
        console.log('3️⃣  Fetching Items...');
        const itemsRes = await request('GET', '/inventory/items', null, token);
        console.log(`Status: ${itemsRes.status}`);
        if(itemsRes.status === 200) {
             console.log('✅ Items Data Example:', JSON.stringify(itemsRes.data.data?.items?.[0] || itemsRes.data, null, 2));
        } else {
             console.error('❌ Failed to fetch items:', itemsRes.data);
        }

    } catch (error) {
        console.error('❌ Test Script Error:', error.message);
    }
})();
