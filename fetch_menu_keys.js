// Script to fetch menu tree and see exact menu_key values
const https = require('https');

// First login to get token
const loginData = JSON.stringify({
    email: 'yashkr4748@gmail.com',
    password: 'yash00725'
});

const loginOptions = {
    hostname: 'inv-api.vayunexsolution.com',
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const loginReq = https.request(loginOptions, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        const result = JSON.parse(data);
        const token = result.data?.token || result.token;
        console.log('Token obtained:', !!token);

        // Now fetch menu tree
        const menuOptions = {
            hostname: 'inv-api.vayunexsolution.com',
            path: '/api/v1/admin/menus/tree',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const menuReq = https.request(menuOptions, (res2) => {
            let menuData = '';
            res2.on('data', d => menuData += d);
            res2.on('end', () => {
                const menus = JSON.parse(menuData);
                console.log('\n=== MENU TREE (id = menu_key used in componentMap) ===\n');
                const printMenu = (items, level = 0) => {
                    items.forEach(m => {
                        console.log(' '.repeat(level * 2) + `id/menu_key: "${m.id}" | title: "${m.title}" | url: "${m.url}"`);
                        if (m.children?.length) printMenu(m.children, level + 1);
                    });
                };
                printMenu(Array.isArray(menus) ? menus : menus.data || []);
            });
        });
        menuReq.end();
    });
});

loginReq.write(loginData);
loginReq.end();
