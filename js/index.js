// Index page logic - same pattern as issues.js and billing.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Index page DOM loaded');
    
    // Wait for all scripts to load and ensure functions are available
    function waitForFunctions() {
        if (typeof updateCounters === 'function' && 
            typeof fetchIssues === 'function' && 
            typeof fetchBilling === 'function') {
            
            console.log('All functions are available, updating counters...');
            
            // Test if elements exist BEFORE calling updateCounters
            console.log('=== TESTING ELEMENT EXISTENCE ===');
            console.log('total-issues element:', document.getElementById('total-issues'));
            console.log('resolved-issues element:', document.getElementById('resolved-issues'));
            console.log('total-billing element:', document.getElementById('total-billing'));
            console.log('approved-billing element:', document.getElementById('approved-billing'));
            console.log('avg-resolve-time element:', document.getElementById('avg-resolve-time'));
            console.log('resolved-in-target element:', document.getElementById('resolved-in-target'));
            console.log('billing-resolve-time element:', document.getElementById('billing-resolve-time'));
            console.log('billing-in-target element:', document.getElementById('billing-in-target'));
            console.log('=== END ELEMENT TEST ===');

            // Ensure metrics are updated - same pattern as billing.js and issues.js
            updateCounters().then(() => {
                console.log('Index metrics updated on page load');
            }).catch(error => {
                console.error('Error updating index metrics:', error);
            });
        } else {
            console.log('Waiting for functions to load...');
            console.log('updateCounters available:', typeof updateCounters);
            console.log('fetchIssues available:', typeof fetchIssues);
            console.log('fetchBilling available:', typeof fetchBilling);
            setTimeout(waitForFunctions, 50);
        }
    }
    
    // Start checking after a small delay
    setTimeout(waitForFunctions, 100);
});
