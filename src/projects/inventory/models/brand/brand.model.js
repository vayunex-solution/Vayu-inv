/**
 * Brand Master Model / DTO for JSON SP interaction
 */
class BrandModel {
    constructor(data) {
        this.brandId = data.brandId || 0;
        this.brandName = data.brandName || '';
        this.shortName = data.shortName || '';
        this.isActive = data.isActive !== undefined ? data.isActive : 'Y';
        this.createdBy = data.createdBy || null;
        this.updatedBy = data.updatedBy || null;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_brand_insupd stored procedure.
     * Keys must match exactly what the SP expects in JSON_EXTRACT.
     */
    toJsonForSp() {
        return {
            BrandId: parseInt(this.brandId, 10),
            BrandName: this.brandName,
            ShortName: this.shortName,
            IsActive: this.isActive,
            CreatedBy: this.createdBy,
            UpdatedBy: this.updatedBy
        };
    }
}

module.exports = { BrandModel };
