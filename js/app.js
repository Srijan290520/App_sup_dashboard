
// Simple dashboard application
const ISSUE_TARGET_MINUTES = 30;
const BILLING_TARGET_MINUTES = 5;

// Helper function to calculate resolution time in minutes from timestamps
function calculateResolutionMinutes(item) {
    if (!item) return 0;
    
    // Get created and resolved timestamps
    const createdTime = item.createdAt || item.createAt || item.createTime;
    const resolvedTime = item.resolveTime || item.resolutionTime;
    
    if (!createdTime || !resolvedTime) return 0;
    
    try {
        const created = new Date(createdTime);
        const resolved = new Date(resolvedTime);
        
        // Calculate difference in minutes
        const diffMs = resolved - created;
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        
        // Return positive value (in case timestamps are out of order)
        return Math.abs(diffMinutes);
    } catch (error) {
        console.error("Error calculating resolution time:", error);
        return 0;
    }
}

// Helper function to calculate average resolution time
function calculateAverageTime(items) {
    if (!items || items.length === 0) return 0;
    
    const totalMinutes = items.reduce((sum, item) => {
        return sum + calculateResolutionMinutes(item);
    }, 0);
    
    return Math.round(totalMinutes / items.length);
}

// Simple function to update counters - works for all pages
async function updateCounters() {
    console.log("=== STARTING updateCounters ===");
    
    try {
        // Check if fetch functions exist
        console.log("fetchIssues function exists:", typeof fetchIssues);
        console.log("fetchBilling function exists:", typeof fetchBilling);
        
        if (typeof fetchIssues !== 'function') {
            console.error("fetchIssues function not found!");
            return;
        }
        if (typeof fetchBilling !== 'function') {
            console.error("fetchBilling function not found!");
            return;
        }
        
        // Get data from API
        console.log("Calling fetchIssues...");
        const issues = await fetchIssues();
        console.log("Calling fetchBilling...");
        const billing = await fetchBilling();
        
        console.log("Raw data received:");
        console.log("- Issues:", issues);
        console.log("- Billing:", billing);
        console.log("- Issues length:", issues ? issues.length : 'undefined');
        console.log("- Billing length:", billing ? billing.length : 'undefined');
        
        // Log the actual structure of the data
        if (issues && issues.length > 0) {
            console.log("First issue object structure:", issues[0]);
            console.log("Issue object keys:", Object.keys(issues[0]));
            console.log("First issue createdAt:", issues[0].createdAt);
            console.log("First issue resolveTime:", issues[0].resolveTime);
        }
        if (billing && billing.length > 0) {
            console.log("First billing object structure:", billing[0]);
            console.log("Billing object keys:", Object.keys(billing[0]));
            console.log("First billing createdAt:", billing[0].createdAt);
            console.log("First billing resolveTime:", billing[0].resolveTime);
        }
        
        if (!issues || !billing) {
            console.error("No data received from API!");
            return;
        }
        
        // Calculate resolved counts
        const resolvedIssues = issues.filter(issue => issue.status === 'Resolved');
        const resolvedBilling = billing.filter(item => item.status === 'Resolved');
        
        // Calculate average resolution times
        const avgIssueTime = calculateAverageTime(resolvedIssues);
        const avgBillingTime = calculateAverageTime(resolvedBilling);
        
        // If no real time data available, use placeholder values
        const displayIssueTime = avgIssueTime > 0 ? avgIssueTime : 0;
        const displayBillingTime = avgBillingTime > 0 ? avgBillingTime : 0;
        
        // Calculate issues within target time (30 minutes)
        const issuesInTarget = resolvedIssues.filter(issue => {
            const resolutionMinutes = calculateResolutionMinutes(issue);
            return resolutionMinutes <= ISSUE_TARGET_MINUTES;
        }).length;
        
        // Calculate billing within target time (5 minutes)
        const billingInTarget = resolvedBilling.filter(item => {
            const resolutionMinutes = calculateResolutionMinutes(item);
            return resolutionMinutes <= BILLING_TARGET_MINUTES;
        }).length;
        
        console.log("Calculated counts:");
        console.log("- Total issues:", issues.length);
        console.log("- Resolved issues:", resolvedIssues.length);
        console.log("- Total billing:", billing.length);
        console.log("- Resolved billing:", resolvedBilling.length);
        console.log("- Avg issue time:", displayIssueTime, "min");
        console.log("- Avg billing time:", displayBillingTime, "min");
        console.log("- Issues in target:", issuesInTarget);
        console.log("- Billing in target:", billingInTarget);
        
        // Get all elements - basic counts and average times
        const totalIssuesEl = document.getElementById('total-issues');
        const resolvedIssuesEl = document.getElementById('resolved-issues');
        let totalBillingEl = document.getElementById('total-billing');
        let approvedBillingEl = document.getElementById('approved-billing');
        const avgResolveTimeEl = document.getElementById('avg-resolve-time');
        const resolvedInTargetEl = document.getElementById('resolved-in-target');
        let billingResolveTimeEl = document.getElementById('billing-resolve-time');
        let billingInTargetEl = document.getElementById('billing-in-target');
        
        console.log("Found elements:");
        console.log("- totalIssuesEl:", !!totalIssuesEl);
        console.log("- resolvedIssuesEl:", !!resolvedIssuesEl);
        console.log("- totalBillingEl:", !!totalBillingEl);
        console.log("- approvedBillingEl:", !!approvedBillingEl);
        console.log("- avgResolveTimeEl:", !!avgResolveTimeEl);
        console.log("- resolvedInTargetEl:", !!resolvedInTargetEl);
        console.log("- billingResolveTimeEl:", !!billingResolveTimeEl);
        console.log("- billingInTargetEl:", !!billingInTargetEl);
        
        // Update basic counts
        if (totalIssuesEl) {
            totalIssuesEl.textContent = issues.length;
            console.log("Set total issues to:", issues.length);
        }
        
        if (resolvedIssuesEl) {
            resolvedIssuesEl.textContent = resolvedIssues.length;
            console.log("Set resolved issues to:", resolvedIssues.length);
        }
        
        // Try to find billing elements with a fresh query
        if (!totalBillingEl) {
            const freshTotalBilling = document.querySelector('#total-billing, [id="total-billing"]');
            totalBillingEl = freshTotalBilling;
        }
        
        if (totalBillingEl || document.getElementById('total-billing')) {
            const element = totalBillingEl || document.getElementById('total-billing');
            element.textContent = billing.length;
            console.log("Set total billing to:", billing.length);
        }
        
        if (approvedBillingEl || document.getElementById('approved-billing')) {
            const element = approvedBillingEl || document.getElementById('approved-billing');
            element.textContent = resolvedBilling.length;
            console.log("Set approved billing to:", resolvedBilling.length);
        }
        
        // Update average times
        if (avgResolveTimeEl) {
            avgResolveTimeEl.textContent = `${displayIssueTime}min`;
            console.log("Set avg resolve time to:", `${displayIssueTime}min`);
        }
        
        if (resolvedInTargetEl) {
            resolvedInTargetEl.textContent = issuesInTarget;
            console.log("Set issues in target to:", issuesInTarget);
        }
        
        if (billingResolveTimeEl || document.getElementById('billing-resolve-time')) {
            const element = billingResolveTimeEl || document.getElementById('billing-resolve-time');
            element.textContent = `${displayBillingTime}min`;
            console.log("Set billing resolve time to:", `${displayBillingTime}min`);
        }
        
        if (billingInTargetEl || document.getElementById('billing-in-target')) {
            const element = billingInTargetEl || document.getElementById('billing-in-target');
            element.textContent = billingInTarget;
            console.log("Set billing in target to:", billingInTarget);
        }
        
        console.log("=== FINISHED updateCounters ===");
        
    } catch (error) {
        console.error("=== ERROR in updateCounters ===", error);
    }
}

// Make it available globally
window.updateCounters = updateCounters;