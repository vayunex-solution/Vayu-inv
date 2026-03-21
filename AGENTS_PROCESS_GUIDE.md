# 🛠️ Vayunex Agent Process Guide: Module Integration

This guide provides a step-by-step workflow for integrating new modules (e.g., City, Brand, Category) from remote repositories into the Vayunex project. Follow these steps to minimize conflicts and optimize compute power.

---

## 1. Git Synchronization (The Isolated Way)
**Goal:** Merge only the required files for a specific module without causing `package.json` or environmental conflicts.

1.  **Fetch from Remote:**
    ```bash
    git fetch upstream  # Sandeep-Ynr/Vayunex-Inventory-api.git
    ```
2.  **Identify files in the module branch:**
    ```bash
    git ls-tree -r upstream/<branch_name> | grep "<module_name>"
    ```
3.  **Cherry-pick specific files (The "Clean" Pull):**
    Instead of merging the whole branch, checkout only the module files into a temporary local branch:
    ```bash
    git checkout upstream/<branch_name> -- src/projects/inventory/controllers/<module>.controller.js
    git checkout upstream/<branch_name> -- src/projects/inventory/services/<module>/<module>.service.js
    git checkout upstream/<branch_name> -- src/projects/inventory/models/<module>/<module>.model.js
    git checkout upstream/<branch_name> -- src/projects/inventory/interfaces/<module>/<module>.interface.js
    ```

---

## 2. Backend Registration & Verification
**Goal:** Ensure the API is active and functional before touching the frontend.

1.  **Register Route in `src/app.js`:**
    ```javascript
    const moduleRoutes = require('./projects/inventory/controllers/module.controller');
    app.use('/api/v1/inventory/modules', moduleRoutes);
    ```
2.  **Verify Locally (PowerShell):**
    Get a token and test the endpoint without needing Postman:
    ```powershell
    # 1. Login to get token
    $res = Invoke-RestMethod -Uri "http://localhost:3002/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@yahoo.com","password":"admin@123"}';
    $token = $res.data.accessToken;

    # 2. Test Get All
    Invoke-RestMethod -Uri "http://localhost:3002/api/v1/inventory/modules" -Headers @{Authorization="Bearer $token"} | ConvertTo-Json
    ```
3.  **Check JSON Structure:**
    Confirm if the data is inside `data` (direct array) or `data.data` (nested object).
    *Typical Backend Response:* `{ "success": true, "data": [...], "totalRecords": N }`

---

## 3. Frontend Connection (The standard Pattern)
**Goal:** Connect the UI efficiently using the established `apiClient` pattern.

### A. Create Service (`src/modules/inventory/services/moduleService.js`)
**CRITICAL:** `apiClient` returns `response.data` (the body) directly.
```javascript
export const getModules = async () => {
    const res = await apiClient.get('/api/v1/inventory/modules');
    return {
        success: true,
        data: res.data || res || [], // Always use this pattern to avoid "Empty/Undefined" bugs
        totalRecords: res.totalRecords || 0
    };
};
```

### B. UI Component (`src/modules/masters/pages/ModulePage.jsx`)
1.  **Copy Pattern from `StateMasterPage.jsx`:** It has the most robust implementation (Filters + CRUD + Double-tap edit).
2.  **Data Extraction:**
    ```javascript
    const res = await apiClient.get('/api/v1/inventory/modules');
    const data = res.data || res || []; // Correct way to handle apiClient unwrapping
    ```

---

## 4. Production Deployment (Syncing to cPanel)

1.  **Local Build:** (Must be done locally to generate the `dist` folder)
    ```bash
    cd vayunex-ui; npm run build; cd ..
    ```
2.  **Push to Origin:**
    ```bash
    git add .
    git commit -m "feat: Integrated <Module Name>"
    git push origin main
    ```
3.  **Sync on cPanel (Via SSH/Terminal):**
    If the cPanel UI shows "cannot deploy", clean the server state:
    ```bash
    cd repositories/Vayu-inv
    git reset --hard HEAD
    # Now click "Deploy HEAD Commit" in cPanel UI
    ```
4.  **Restart Backend:**
    Go to cPanel **"Setup Node.js App"** and click **Restart**.

---

## 💡 Pro Tips for Future Agents
-   **Always** check `apiClient.js` response interceptors. If it says `return response.data`, don't look for `.data.data` in your components.
-   **Always** test authentication first. If a module returns empty, verify headers are being sent.
-   **Avoid** broad merges. Use the file-specific `git checkout` method to keep the codebase clean.
