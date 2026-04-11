const unitService = require('./src/projects/inventory/services/unit/unit.service');
const itemService = require('./src/projects/inventory/services/item/item.service');

async function test() {
    console.log("Testing Unit Service...");
    try {
        const units = await unitService.getAll();
        console.log("Unit Result:", JSON.stringify(units, null, 2));
    } catch (e) {
        console.error("UNIT ERROR:", e.message);
    }

    console.log("\nTesting Item Service...");
    try {
        const items = await itemService.getAll();
        console.log("Item Result:", JSON.stringify(items, null, 2));
    } catch (e) {
        console.error("ITEM ERROR:", e.message);
    }
    
    process.exit();
}

test();
