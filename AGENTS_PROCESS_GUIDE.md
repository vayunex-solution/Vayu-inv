# 🚀 Universal Module Integration Framework

This guide defines the standardized process for syncing, verifying, and deploying *any* new feature or API from a remote repository into the local project environment.

---

## 1. Abstract Git Sync Strategy
**Objective:** Pull specific technical components (Logic & Schema) without affecting core project configurations.

1.  **Fetch & Discover:**
    ```bash
    git fetch <REMOTE_NAME>
    # List files in the target branch to understand structure
    git ls-tree -r <REMOTE_NAME>/<TARGET_BRANCH>
    ```
2.  **Isolated Checkout (Cherry-pick Mode):**
    Always checkout individual files to prevent merge conflicts in shared configuration files.
    ```bash
    git checkout <REMOTE_NAME>/<TARGET_BRANCH> -- <FILE_PATH_1> <FILE_PATH_2>
    ```
3.  **Conflict Avoidance:** Before overwriting, check the differences:
    ```bash
    git diff HEAD <REMOTE_NAME>/<TARGET_BRANCH> -- <FILE_PATH>
    ```

---

## 2. Backend Implementation Standards
**Objective:** Maintain a strict layered architecture for scalability.

1.  **Route Registration:**
    Ensure all new logic is registered under the project's primary entry point (e.g., `app.js` or `main.js`).
2.  **Environmental Parity:**
    Verify if the new module requires new variables (DB keys, API secrets) in the local environment file.
3.  **Cross-Platform API Testing:**
    Test raw JSON output efficiently via terminal:
    ```bash
    # Step 1: Authentication (if required)
    # Step 2: Test Endpoint
    Invoke-RestMethod -Uri "<LOCAL_URL>/<ENDPOINT>" -Headers @{Authorization="Bearer <TOKEN>"} | ConvertTo-Json
    ```

---

## 3. Frontend Architecture (Universal Connectivity)
**Objective:** Consistent data handling using a central API client.

### A. Generic Service Pattern
**CRITICAL:** API clients often unwrap response bodies. Use a defensive data extraction pattern.
```javascript
export const fetchData = async (params) => {
    const res = await apiClient.get('/<ENDPOINT_PATH>', { params });
    return {
        success: true,
        data: res.data || res || [], // Handles both manual and automatic unwrapping
        totalRecords: res.totalRecords || 0
    };
};
```

### B. UI Component Pattern
*   **Consistency:** Mirror the backend JSON keys in the frontend state.
*   **Design:** Implement intuitive editing features (e.g., inline editing, double-click actions) for a premium user experience.

---

## 4. Deployment Flow (Source to Production)

1.  **Local Sync:** Commit all code changes to the primary development branch.
2.  **Production Build:** Always generate a fresh production bundle after frontend changes.
3.  **Global Push:** Push code to the centralized deployment repository.
4.  **Production Sync:**
    *   **State Reset:** Purge any "dirty" or modified files on the production server.
    *   **Deployment:** Pull the latest commit and execute deployment tasks.
    *   **Application Cycle:** Restart the application service to apply core logic changes.

---

## 🧠 Architectural Integrity Check
-   [ ] Are new routes/services registered correctly?
-   [ ] Does the API return a standardized success response?
-   [ ] Is the frontend talking to the correct production endpoint?
-   [ ] Did you generate a fresh production build?
-   [ ] Did you restart the production server service?
