/**
 * Account Head Model / DTO for JSON SP interaction
 */
class AccountHeadModel {
    constructor(data) {
        this.accountId = data.accountid || 0;
        this.groupId = data.groupid || 0;
        this.accountHead = data.accounthead || '';
        this.yearOpeningBalance = data.yearopeningbalance || 0;
        this.balance3 = data.balance3 || 0;
        this.lastYearBalance = data.lastyearbalance || 0;
        this.associatedAccountId = data.associatedaccountid || null;
        this.emdCustomerId = data.emdcustomerid || null;
        this.idConfirmed = data.idconfirmed || 'N';
        this.branchId = data.branchid || 0;
        this.bsGroupId = data.bsgroupid || null;
        this.address1 = data.address1 || '';
        this.address2 = data.address2 || '';
        this.cityId = data.cityid || null;
        this.stateId = data.stateid || null;
        this.mobNo = data.mobno || '';
        this.emailId = data.emailid || '';
        this.panNo = data.panno || '';
        this.bankName = data.bankname || '';
        this.bankAcNo = data.bankacno || '';
        this.ifscCode = data.ifsccode || '';
        this.contactPerson = data.contacperson || ''; // Field name in JSON payload for SP
        this.gstin = data.gstin || '';
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_accounthead_insupd stored procedure.
     */
    toJsonForSp() {
        return {
            accountid: parseInt(this.accountId, 10),
            groupid: parseInt(this.groupId, 10),
            accounthead: this.accountHead,
            yearopeningbalance: parseFloat(this.yearOpeningBalance),
            balance3: parseFloat(this.balance3),
            lastyearbalance: parseFloat(this.lastYearBalance),
            associatedaccountid: this.associatedAccountId ? parseInt(this.associatedAccountId, 10) : null,
            emdcustomerid: this.emdCustomerId ? parseInt(this.emdCustomerId, 10) : null,
            idconfirmed: this.idConfirmed,
            branchid: parseInt(this.branchId, 10),
            bsgroupid: this.bsGroupId ? parseInt(this.bsGroupId, 10) : null,
            address1: this.address1,
            address2: this.address2,
            cityid: this.cityId ? parseInt(this.cityId, 10) : null,
            stateid: this.stateId ? parseInt(this.stateId, 10) : null,
            mobno: this.mobNo,
            emailid: this.emailId,
            panno: this.panNo,
            bankname: this.bankName,
            bankacno: this.bankAcNo,
            ifsccode: this.ifscCode,
            contacperson: this.contactPerson, // Missing 't' as per SP
            gstin: this.gstin
        };
    }
}

module.exports = { AccountHeadModel };
