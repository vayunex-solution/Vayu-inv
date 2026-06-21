const CustomerInterface = require("../../interfaces/customer/customer.interface");
const { CustomerModel } = require("../../models/customer/customer.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class CustomerService extends CustomerInterface {
    /**
     * Retrieve a customer by ID
     * Uses usp_customer_list with ActionType = 1
     * @param {number} id 
     */
    async getById(id) {
        const result = await callProcedureMultiParam('usp_customer_list', [1, id]);
        
        if (result && result.success && result.data && result.data.length > 0) {
            const customer = result.data[0];
            
            // The Addresses field is returned as a JSON string from SQL
            if (customer.Addresses) {
                try {
                    customer.addresses = JSON.parse(customer.Addresses);
                } catch (e) {
                    customer.addresses = [];
                }
                delete customer.Addresses;
            } else {
                customer.addresses = [];
            }
            
            return { success: true, data: customer };
        }
        
        return { success: false, message: "Customer not found" };
    }

    /**
     * Retrieve all customers
     * Uses usp_customer_list with ActionType = 2
     */
    async getAll() {
        const result = await callProcedureMultiParam('usp_customer_list', [2, 0]);
        
        if (result && result.success && result.data) {
            return { success: true, data: result.data };
        }
        
        return { success: false, message: "No data returned from database", data: [] };
    }

    /**
     * Retrieve active customer dropdown list
     * Uses usp_customer_list with ActionType = 3
     */
    async getDropdown() {
        const result = await callProcedureMultiParam('usp_customer_list', [3, 0]);
        
        if (result && result.success && result.data) {
            return { success: true, data: result.data };
        }
        
        return { success: false, message: "No dropdown data returned", data: [] };
    }

    /**
     * Create a new customer
     * Uses usp_customer_insupd with ActionType = 1
     * @param {Object} data 
     */
    async create(data) {
        const model = new CustomerModel(data);
        const payload = model.toJsonForSp();
        
        const result = await callProcedureMultiParam('usp_customer_insupd', [1, payload, 0, 0]);
        
        if (result && result.success && result.data && result.data.length > 0) {
            return { success: true, ...result.data[0] };
        }
        
        return { success: false, message: "Failed to create customer" };
    }

    /**
     * Update an existing customer
     * Uses usp_customer_insupd with ActionType = 2
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new CustomerModel(data);
        const payload = model.toJsonForSp();
        
        const result = await callProcedureMultiParam('usp_customer_insupd', [2, payload, id, 0]);
        
        if (result && result.success && result.data && result.data.length > 0) {
            return { success: true, ...result.data[0] };
        }
        
        return { success: false, message: "Failed to update customer" };
    }

    /**
     * Delete a customer (Soft)
     * Uses usp_customer_insupd with ActionType = 3
     * @param {number} id 
     * @param {number} deletedBy 
     */
    async delete(id, deletedBy) {
        const result = await callProcedureMultiParam('usp_customer_insupd', [3, null, id, deletedBy || 0]);
        
        if (result && result.success && result.data && result.data.length > 0) {
            return { success: true, ...result.data[0] };
        }
        
        return { success: false, message: "Failed to delete customer" };
    }
}

module.exports = new CustomerService();
