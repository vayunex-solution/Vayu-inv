/**
 * Account Group Model / DTO for JSON SP interaction
 */
class AccountGroupModel {
    constructor(data) {
        this.groupId = data.GroupId || 0;
        this.groupCode = data.GroupCode || '';
        this.parentGroupId = data.ParentGroupId || null;
        this.position = data.Position || 0;
        this.belongsTo = data.Belongsto || '';
        this.groupType = data.GroupType || '';
        this.groupName = data.GroupName || '';
        this.editable = data.Editable !== undefined ? data.Editable : 1;
        this.subledger = data.Subledger !== undefined ? data.Subledger : 0;
        this.schedule = data.Schedule || '';
        this.trialOrder = data.TrialOrder || 0;
        this.mdRepo = data.MdRepo || '';
        this.branchId = data.BranchId || null;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_accountgroups_insupd stored procedure.
     */
    toJsonForSp() {
        return {
            GroupId: parseInt(this.groupId, 10),
            GroupCode: this.groupCode,
            ParentGroupId: this.parentGroupId ? parseInt(this.parentGroupId, 10) : null,
            Position: parseInt(this.position, 10),
            Belongsto: this.belongsTo,
            GroupType: this.groupType,
            GroupName: this.groupName,
            Editable: parseInt(this.editable, 10),
            Subledger: parseInt(this.subledger, 10),
            Schedule: this.schedule,
            TrialOrder: parseInt(this.trialOrder, 10),
            MdRepo: this.mdRepo,
            BranchId: this.branchId ? parseInt(this.branchId, 10) : null
        };
    }
}

module.exports = { AccountGroupModel };
