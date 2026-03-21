/**
 * Verification Script for City API
 * 
 * This script checks if the City API components are correctly exported
 * and maps to the expected stored procedures.
 */

const cityService = require('./src/projects/inventory/services/city/city.service');

console.log('--- City Service Check ---');
console.log('getAll:', typeof cityService.getAll);
console.log('getDropdown:', typeof cityService.getDropdown);
console.log('getById:', typeof cityService.getById);
console.log('create:', typeof cityService.create);
console.log('update:', typeof cityService.update);
console.log('delete:', typeof cityService.delete);

if (typeof cityService.getAll === 'function' &&
    typeof cityService.getDropdown === 'function' &&
    typeof cityService.getById === 'function' &&
    typeof cityService.create === 'function' &&
    typeof cityService.update === 'function' &&
    typeof cityService.delete === 'function') {
    console.log('SUCCESS: All service methods are defined.');
} else {
    console.log('FAILURE: Some service methods are missing.');
}

const { CityModel } = require('./src/projects/inventory/models/city/city.model');
const model = new CityModel({
    cityName: 'Test City',
    stateId: 1,
    countryId: 1
});

console.log('\n--- City Model JSON for SP Check ---');
const json = model.toJsonForSp();
console.log(JSON.stringify(json, null, 2));

if (json.CityName === 'Test City' && json.StateId === 1 && json.CountryId === 1) {
    console.log('SUCCESS: Model mapping is correct.');
} else {
    console.log('FAILURE: Model mapping is incorrect.');
}
