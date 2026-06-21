const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Customer Reads (if needed in future)
const Customer = sequelize.define("Customer", {
    customerId: { field: 'CustomerId', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerCode: { field: 'CustomerCode', type: DataTypes.STRING(50), unique: true, allowNull: false },
    customerName: { field: 'CustomerName', type: DataTypes.STRING(255), allowNull: false },
    legalName: { field: 'LegalName', type: DataTypes.STRING(255), allowNull: true },
    gstin: { field: 'GSTIN', type: DataTypes.STRING(15), allowNull: true },
    pan: { field: 'PAN', type: DataTypes.STRING(10), allowNull: false },
    isGstRegistered: { field: 'IsGSTRegistered', type: DataTypes.TINYINT, allowNull: false },
    mobileNo: { field: 'MobileNo', type: DataTypes.STRING(15), allowNull: true },
    email: { field: 'Email', type: DataTypes.STRING(100), allowNull: true },
    customerType: { field: 'CustomerType', type: DataTypes.STRING(50), allowNull: false },
    accountId: { field: 'AccountId', type: DataTypes.INTEGER, allowNull: false },
    isActive: { field: 'IsActive', type: DataTypes.TINYINT, allowNull: false },
    createdBy: { field: 'CreatedBy', type: DataTypes.INTEGER, allowNull: false },
    createdOn: { field: 'CreatedOn', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modifiedBy: { field: 'ModifiedBy', type: DataTypes.INTEGER, allowNull: true },
    modifiedOn: { field: 'ModifiedOn', type: DataTypes.DATE }
}, {
    tableName: "tbl_Customer",
    timestamps: false
});

// Sequelize Model for CustomerAddress Reads (if needed in future)
const CustomerAddress = sequelize.define("CustomerAddress", {
    addressId: { field: 'AddressId', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { field: 'CustomerId', type: DataTypes.INTEGER, allowNull: false },
    addressType: { field: 'AddressType', type: DataTypes.STRING(20), allowNull: false },
    addressLine1: { field: 'AddressLine1', type: DataTypes.STRING(255), allowNull: false },
    addressLine2: { field: 'AddressLine2', type: DataTypes.STRING(255), allowNull: true },
    countryId: { field: 'CountryId', type: DataTypes.INTEGER, allowNull: false },
    stateId: { field: 'StateId', type: DataTypes.INTEGER, allowNull: false },
    districtId: { field: 'DistrictId', type: DataTypes.INTEGER, allowNull: true },
    cityId: { field: 'CityId', type: DataTypes.INTEGER, allowNull: false },
    pincode: { field: 'Pincode', type: DataTypes.STRING(10), allowNull: false },
    gstin: { field: 'GSTIN', type: DataTypes.STRING(15), allowNull: true },
    pan: { field: 'PAN', type: DataTypes.STRING(10), allowNull: true },
    contactPerson: { field: 'ContactPerson', type: DataTypes.STRING(150), allowNull: true },
    mobileNo: { field: 'MobileNo', type: DataTypes.STRING(15), allowNull: true },
    whatsAppNo: { field: 'WhatsAppNo', type: DataTypes.STRING(15), allowNull: true },
    rmn: { field: 'RMN', type: DataTypes.STRING(15), allowNull: true },
    email: { field: 'Email', type: DataTypes.STRING(100), allowNull: true },
    bankName: { field: 'BankName', type: DataTypes.STRING(150), allowNull: true },
    accountNumber: { field: 'AccountNumber', type: DataTypes.STRING(50), allowNull: true },
    ifscCode: { field: 'IFSCCode', type: DataTypes.STRING(20), allowNull: true },
    branchName: { field: 'BranchName', type: DataTypes.STRING(150), allowNull: true },
    isDefault: { field: 'IsDefault', type: DataTypes.TINYINT, allowNull: true },
    isActive: { field: 'IsActive', type: DataTypes.TINYINT, allowNull: true },
    createdBy: { field: 'CreatedBy', type: DataTypes.INTEGER, allowNull: false },
    createdOn: { field: 'CreatedOn', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modifiedBy: { field: 'ModifiedBy', type: DataTypes.INTEGER, allowNull: true },
    modifiedOn: { field: 'ModifiedOn', type: DataTypes.DATE }
}, {
    tableName: "tbl_CustomerAddress",
    timestamps: false
});

// Domain Model / DTO for JSON SP interaction
class CustomerAddressModel {
    constructor(data) {
        this.addressId = data.addressId || data.address_id || data.AddressId || 0;
        this.addressType = data.addressType || data.address_type || data.AddressType || 'Billing';
        this.addressLine1 = data.addressLine1 || data.address_line1 || data.AddressLine1 || '';
        this.addressLine2 = data.addressLine2 || data.address_line2 || data.AddressLine2 || '';
        this.countryId = data.countryId || data.country_id || data.CountryId || 0;
        this.stateId = data.stateId || data.state_id || data.StateId || 0;
        this.districtId = data.districtId !== undefined ? data.districtId : 
                          (data.district_id !== undefined ? data.district_id : 
                          (data.DistrictId !== undefined ? data.DistrictId : null));
        this.cityId = data.cityId || data.city_id || data.CityId || 0;
        this.pincode = data.pincode || data.Pincode || '';
        this.gstin = data.gstin || data.GSTIN || '';
        this.pan = data.pan || data.PAN || '';
        this.contactPerson = data.contactPerson || data.contact_person || data.ContactPerson || '';
        this.mobileNo = data.mobileNo || data.mobile_no || data.MobileNo || '';
        this.whatsAppNo = data.whatsAppNo || data.whatsapp_no || data.WhatsAppNo || '';
        this.rmn = data.rmn || data.RMN || '';
        this.email = data.email || data.Email || '';
        this.bankName = data.bankName || data.bank_name || data.BankName || '';
        this.accountNumber = data.accountNumber || data.account_number || data.AccountNumber || '';
        this.ifsccode = data.ifsccode || data.ifsc_code || data.IFSCCode || '';
        this.branchName = data.branchName || data.branch_name || data.BranchName || '';
        this.isDefault = data.isDefault !== undefined ? data.isDefault : 
                         (data.is_default !== undefined ? data.is_default : 
                         (data.IsDefault !== undefined ? data.IsDefault : 0));
        this.isActive = data.isActive !== undefined ? data.isActive : 
                        (data.is_active !== undefined ? data.is_active : 
                        (data.IsActive !== undefined ? data.IsActive : 1));
    }

    toJson() {
        return {
            AddressType: this.addressType,
            AddressLine1: this.addressLine1,
            AddressLine2: this.addressLine2 || null,
            CountryId: parseInt(this.countryId, 10),
            StateId: parseInt(this.stateId, 10),
            DistrictId: this.districtId ? parseInt(this.districtId, 10) : null,
            CityId: parseInt(this.cityId, 10),
            Pincode: this.pincode,
            GSTIN: this.gstin || null,
            PAN: this.pan || null,
            ContactPerson: this.contactPerson || null,
            MobileNo: this.mobileNo || null,
            WhatsAppNo: this.whatsAppNo || null,
            RMN: this.rmn || null,
            Email: this.email || null,
            BankName: this.bankName || null,
            AccountNumber: this.accountNumber || null,
            IFSCCode: this.ifsccode || null,
            BranchName: this.branchName || null,
            IsDefault: this.isDefault ? 1 : 0,
            IsActive: this.isActive ? 1 : 0
        };
    }
}

class CustomerModel {
    constructor(data) {
        this.customerId = data.customerId || data.customer_id || data.CustomerId || 0;
        this.customerName = data.customerName || data.customer_name || data.CustomerName || '';
        this.legalName = data.legalName || data.legal_name || data.LegalName || '';
        this.gstin = data.gstin || data.GSTIN || '';
        this.pan = data.pan || data.PAN || '';
        this.isGstRegistered = data.isGstRegistered !== undefined ? data.isGstRegistered : 
                               (data.is_gst_registered !== undefined ? data.is_gst_registered : 
                               (data.IsGSTRegistered !== undefined ? data.IsGSTRegistered : 0));
        this.mobileNo = data.mobileNo || data.mobile_no || data.MobileNo || '';
        this.email = data.email || data.Email || '';
        this.customerType = data.customerType || data.customer_type || data.CustomerType || 'B2B';
        this.isActive = data.isActive !== undefined ? data.isActive : 
                        (data.is_active !== undefined ? data.is_active : 
                        (data.IsActive !== undefined ? data.IsActive : 1));
        this.createdBy = data.createdBy || data.created_by || data.CreatedBy || null;
        this.updatedBy = data.updatedBy || data.updated_by || data.UpdatedBy || null;
        const rawAddresses = data.addresses || data.Addresses || [];
        this.addresses = Array.isArray(rawAddresses) ? rawAddresses.map(addr => new CustomerAddressModel(addr)) : [];
    }

    toJsonForSp() {
        return {
            CustomerName: this.customerName,
            LegalName: this.legalName || null,
            GSTIN: this.gstin || null,
            PAN: this.pan,
            IsGSTRegistered: this.isGstRegistered ? 1 : 0,
            MobileNo: this.mobileNo || null,
            Email: this.email || null,
            CustomerType: this.customerType,
            IsActive: this.isActive ? 1 : 0,
            created_by: this.createdBy,
            updated_by: this.updatedBy,
            Addresses: this.addresses.map(addr => addr.toJson())
        };
    }
}

module.exports = { Customer, CustomerAddress, CustomerModel, CustomerAddressModel };
