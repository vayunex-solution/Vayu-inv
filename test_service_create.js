const service = require('./src/projects/inventory/services/country.service');

console.log('Testing CountryService.create...');
service.create({
    country_name: 'TestCountry',
    country_code: 'TC',
    is_status: true,
    created_by: 1
}).then(res => {
    console.log('Success:', res);
}).catch(err => {
    console.error('Error:', err);
});
