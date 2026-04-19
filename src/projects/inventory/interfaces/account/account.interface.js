/**
 * Account Interface (Contract)
 * Defines method signatures for Account Group and Account Head management.
 * Implementation resides in the Service layer.
 * @interface
 */
class AccountInterface {
    // --- Account Group Methods ---
    getGroupById(id) { }
    getAllGroups() { }
    getGroupsDropdown() { }
    createGroup(data) { }
    updateGroup(id, data) { }
    deleteGroup(id) { }

    // --- Account Head Methods ---
    getHeadById(id) { }
    getAllHeads() { }
    getHeadsDropdown() { }
    createHead(data) { }
    updateHead(id, data) { }
    deleteHead(id) { }
}

module.exports = AccountInterface;
