// Google Sheets API Integration - Updated with CORS-enabled deployment
if (!window.SHEETS_API_URL) {
    window.SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbyY300vYmtv3efNjK0unfG73Y--rGTW8ONeQKEs3F4-QTuTk7gjTZxwcJ0-dbjLkq_Y/exec";
    console.log("Using updated SHEETS_API_URL with proper CORS support");
}

// No caching to ensure fresh data every time
// Simplified fetch issues function
async function fetchIssues() {
    try {
        console.log("Fetching issues from Google Sheets...");
        // Add cache busting parameter to prevent browser caching
        const cacheBuster = `&_=${Date.now()}`;
        const response = await fetch(`${window.SHEETS_API_URL}?action=get&sheet=Issues${cacheBuster}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Successfully fetched issues:", data.length);
        return data;
    } catch (error) {
        console.error("Error fetching issues from Google Sheets:", error);
        // Return empty array on error
        return [];
    }
}

// Simplified fetch billing function
async function fetchBilling() {
    try {
        console.log("Fetching billing from Google Sheets...");
        // Add cache busting parameter to prevent browser caching
        const cacheBuster = `&_=${Date.now()}`;
        const response = await fetch(`${window.SHEETS_API_URL}?action=get&sheet=Billing${cacheBuster}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Successfully fetched billing:", data.length);
        return data;
    } catch (error) {
        console.error("Error fetching billing from Google Sheets:", error);
        // Return empty array on error
        return [];
    }
}

// Make functions available globally
window.fetchIssues = fetchIssues;
window.fetchBilling = fetchBilling;

// Clear caches function - call this when data is added or updated
function clearCaches() {
    console.log("Clearing data caches");
    cachedIssues = null;
    cachedBilling = null;
    lastFetchTime.issues = 0;
    lastFetchTime.billing = 0;
}

// Force refresh data from Google Sheets
async function forceRefreshData() {
    console.log("Force refreshing data from Google Sheets");
    
    // Clear caches first
    clearCaches();
    
    try {
        // Fetch fresh data
        const issuesResponse = await fetch(`${SHEETS_API_URL}?action=get&sheet=Issues`);
        const issuesData = await issuesResponse.json();
        cachedIssues = issuesData;
        lastFetchTime.issues = Date.now();
        
        const billingResponse = await fetch(`${SHEETS_API_URL}?action=get&sheet=Billing`);
        const billingData = await billingResponse.json();
        cachedBilling = billingData;
        lastFetchTime.billing = Date.now();
        
        console.log("Force refresh completed with new data:", {
            issues: issuesData.length,
            billing: billingData.length
        });
        
        // Return the fresh data
        return {
            issues: issuesData,
            billing: billingData
        };
    } catch (error) {
        console.error("Error during force refresh:", error);
        return {
            issues: [],
            billing: []
        };
    }
}

// Check if the Google Sheets setup is correct
async function checkSheetsSetup() {
    try {
        console.log("Checking Google Sheets setup...");
        
        // Try to connect to the API
        const testResponse = await fetch(`${SHEETS_API_URL}?action=get&sheet=Test`);
        const testResult = await testResponse.text();
        console.log("Test connection response:", testResult);
        
        // Check for Issues sheet
        const issuesResponse = await fetch(`${SHEETS_API_URL}?action=get&sheet=Issues`);
        const issuesResult = await issuesResponse.json();
        console.log("Issues sheet check:", issuesResult);
        
        // Check for Billing sheet
        const billingResponse = await fetch(`${SHEETS_API_URL}?action=get&sheet=Billing`);
        const billingResult = await billingResponse.json();
        console.log("Billing sheet check:", billingResult);
        
        return {
            success: true,
            issues: issuesResult,
            billing: billingResult
        };
    } catch (error) {
        console.error("Error checking Google Sheets setup:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Add a new issue to Google Sheets
async function addIssue(issue) {
    try {
        console.log("Adding issue to Google Sheets:", issue);
        const params = new URLSearchParams();
        params.append('action', 'append');
        params.append('sheet', 'Issues');
        params.append('data', JSON.stringify(issue));
        
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Issue added to Google Sheets:", result);
        
        // Clear all caches
        clearCaches();
        
        // Also update localStorage as fallback
        const issues = JSON.parse(localStorage.getItem('issues') || '[]');
        issues.push(issue);
        localStorage.setItem('issues', JSON.stringify(issues));
        
        return result;
    } catch (error) {
        console.error("Error adding issue to Google Sheets:", error);
        // Fall back to localStorage
        const issues = JSON.parse(localStorage.getItem('issues') || '[]');
        issues.push(issue);
        localStorage.setItem('issues', JSON.stringify(issues));
        
        return { success: false, error: error.message };
    }
}

// Add billing correction to Google Sheets
async function addBilling(billing) {
    try {
        console.log("Adding billing correction to Google Sheets:", billing);
        const params = new URLSearchParams();
        params.append('action', 'append');
        params.append('sheet', 'Billing');
        params.append('data', JSON.stringify(billing));
        
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Billing correction added to Google Sheets:", result);
        
        // Clear all caches
        clearCaches();
        
        // Also update localStorage as fallback
        const billingData = JSON.parse(localStorage.getItem('billing') || '[]');
        billingData.push(billing);
        localStorage.setItem('billing', JSON.stringify(billingData));
        
        return result;
    } catch (error) {
        console.error("Error adding billing to Google Sheets:", error);
        // Fall back to localStorage
        const billingData = JSON.parse(localStorage.getItem('billing') || '[]');
        billingData.push(billing);
        localStorage.setItem('billing', JSON.stringify(billingData));
        
        return { success: false, error: error.message };
    }
}

// Update issue in Google Sheets
async function updateIssue(index, issue) {
    try {
        console.log("Updating issue in Google Sheets:", index, issue);
        const params = new URLSearchParams();
        params.append('action', 'update');
        params.append('sheet', 'Issues');
        params.append('id', index + 2); // +2 because Sheets is 1-indexed and we have a header row
        params.append('data', JSON.stringify(issue));
        
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Issue updated in Google Sheets:", result);
        
        // Clear all caches
        clearCaches();
        
        // Also update localStorage as fallback
        const issues = JSON.parse(localStorage.getItem('issues') || '[]');
        issues[index] = issue;
        localStorage.setItem('issues', JSON.stringify(issues));
        
        return result;
    } catch (error) {
        console.error("Error updating issue in Google Sheets:", error);
        // Fall back to localStorage
        const issues = JSON.parse(localStorage.getItem('issues') || '[]');
        issues[index] = issue;
        localStorage.setItem('issues', JSON.stringify(issues));
        
        return { success: false, error: error.message };
    }
}

// Update billing in Google Sheets
async function updateBilling(index, billing) {
    try {
        console.log("Updating billing in Google Sheets:", index, billing);
        const params = new URLSearchParams();
        params.append('action', 'update');
        params.append('sheet', 'Billing');
        params.append('id', index + 2); // +2 because Sheets is 1-indexed and we have a header row
        params.append('data', JSON.stringify(billing));
        
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Billing updated in Google Sheets:", result);
        
        // Clear all caches
        clearCaches();
        
        // Also update localStorage as fallback
        const billingData = JSON.parse(localStorage.getItem('billing') || '[]');
        billingData[index] = billing;
        localStorage.setItem('billing', JSON.stringify(billingData));
        
        return result;
    } catch (error) {
        console.error("Error updating billing in Google Sheets:", error);
        // Fall back to localStorage
        const billingData = JSON.parse(localStorage.getItem('billing') || '[]');
        billingData[index] = billing;
        localStorage.setItem('billing', JSON.stringify(billingData));
        
        return { success: false, error: error.message };
    }
}
