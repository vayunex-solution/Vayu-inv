/**
 * District Master Model / DTO for JSON SP interaction
 */
class DistrictModel {
    constructor(data) {
        this.districtId = data.districtId || 0;
        this.districtName = data.districtName || '';
        this.stateId = data.stateId || 0;
        this.countryId = data.countryId || 0;
        this.isActive = data.isActive !== undefined ? data.isActive : 'Y';
        this.createdBy = data.createdBy || null;
        this.updatedBy = data.updatedBy || null;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_district_insupd stored procedure.
     * Keys must match exactly what the SP expects in JSON_EXTRACT.
     */
    toJsonForSp() {
        return {
            DistrictId: parseInt(this.districtId, 10),
            DistrictName: this.districtName,
            StateId: parseInt(this.stateId, 10),
            CountryId: parseInt(this.countryId, 10),
            IsActive: this.isActive,
            CreatedBy: this.createdBy,
            UpdatedBy: this.updatedBy
        };
    }
}

module.exports = { DistrictModel };
