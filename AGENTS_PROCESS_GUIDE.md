# 🚀 Vayunex Universal Integration Framework

This guide defines the standardized process for syncing, verifying, and deploying *any* new module or API feature (e.g., Masters, Reports, Auth, Transactional etc.) to the Vayunex ecosystem.

---

## 1. Universal Git Sync Strategy
**Objective:** Pull specific technical components (Logic & Schema) without affecting core configurations (`package.json`, `.env`, `.cpanel.yml`).

1.  **Fetch & Discover:**
    ```bash
    git fetch upstream
    # List files in the target branch to see the structure
    git ls-tree -r upstream/<TARGET_BRANCH>
    ```
2.  **Isolated Checkout (Cherry-pick Mode):**
    Always checkout individual files to prevent merge conflicts in unrelated files.
    ```bash
    git checkout upstream/<TARGET_BRANCH> -- <FILE_PATH_1> <FILE_PATH_2> ...
    ```
3.  **Conflict Avoidance:** If a file exists locally, check the diff before overwrite:
    ```bash
    git diff HEAD upstream/<TARGET_BRANCH> -- <FILE_PATH>
    ```

---

## 2. Backend Implementation Standards
**Objective:** Maintain a strict N-tier architecture for scalability.

1.  **Route Registration (`src/app.js`):**
    Ensure all new controllers are registered under the correct API version prefix (`/api/v1/...`).
2.  **Environmental Parity:**
    Always check `.env` for new database variables or third-party keys required by the new module.
3.  **Universal API Testing (PowerShell):**
    Test raw JSON output before frontend development:
    ```powershell
    # Standard Login & Token Retrieval
    $login = Invoke-RestMethod -Uri "http://localhost:3002/api/v1/auth/login" -Method POST -Body '{"email":"admin@yahoo.com","password":"admin@123"}' -ContentType "application/json"
    $token = $login.data.accessToken

    # Test Any GET/POST Endpoint
    Invoke-RestMethod -Uri "http://localhost:3002/api/v1/inventory/<ENDPOINT_NAME>" -Headers @{Authorization="Bearer $token"} | ConvertTo-Json
    ```

---

## 3. Frontend Architecture (Universal API Connectivity)
**Objective:** Consistent data handling using `apiClient`.

### A. Generic Service Pattern
**CRITICAL:** `apiClient` returns the response body directly. Use a defensive data extraction pattern.
```javascript
// Path: vayunex-ui/src/modules/<MODULE>/services/<NAME>Service.js
export const fetchModuleData = async (params) => {
    const res = await apiClient.get('/api/v1/<PATH>', { params });
    return {
        success: true,
        data: res.data || res || [], // UNIVERSAL FIX: Handles both manual and automatic unwrapping
        totalRecords: res.totalRecords || 0
    };
};
```

### B. UI Grid/Form Pattern
*   Use `react-bootstrap` for layout.
*   Use `lucide-react` for iconography.
*   Implement **inline double-click editing** for all "Master" type pages for premium UX.
*   **Data Binding:** Always mirror the backend JSON keys (e.g., `StateId`, `CountryId`) in the frontend state.

---

## 4. Total Deployment Flow (Local to Production)

1.  **Local Sync:** Commit all code changes.
2.  **Production Build:** (Mandatory for React changes)
    ```bash
    cd vayunex-ui; npm run build; cd ..
    ```
3.  **Global Push:**
    ```bash
    git add .; git commit -m "feat: Integrated <MODULE_NAME>"; git push origin main
    ```
4.  **cPanel Deployment:**
    *   **Login SSH:** `git reset --hard HEAD` (Purge server-side dirty files).
    *   **cPanel UI:** Click **Deploy HEAD Commit**.
    *   **Server Restart:** Restart Node.js app to apply `app.js` changes.

---

## 🧠 Architectural Integrity Check
-   [ ] Are routes registered in `app.js`?
-   [ ] Does the API return `success: true`?
-   [ ] Is the frontend talking to the production `inv-api` URL?
-   [ ] Did you run a fresh build for `.dist` folder?
-   [ ] Did you restart the server on cPanel?
