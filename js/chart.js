// Function to get the last N months as labels
function getLastNMonths(n = 6) {
    const months = [];
    const date = new Date();
    
    for (let i = 0; i < n; i++) {
        const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const monthYear = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        months.unshift(monthYear);
    }
    
    return months;
}

// Process issues data for the chart
function processIssuesData(issues) {
    // Start from July 2025 and show 6 months forward
    const startYear = 2025;
    const startMonth = 6; // July (0-indexed, so 6 is July)
    const months = {};
    
    // Create 6 months starting from July 2025
    for (let i = 0; i < 6; i++) {
        const monthDate = new Date(startYear, startMonth + i, 1);
        const monthYear = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        months[monthYear] = 0;
    }
    
    // Count issues for each month
    issues.forEach(item => {
        if (!item.createdAt) return;
        const date = new Date(item.createdAt);
        const monthYear = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        
        // Only count if it's in our predefined months
        if (months[monthYear] !== undefined) {
            months[monthYear]++;
        }
    });

    return {
        labels: Object.keys(months),
        data: Object.values(months)
    };
}

// Process billing data for the chart
function processBillingData(billing) {
    // Start from July 2025 and show 6 months forward
    const startYear = 2025;
    const startMonth = 6; // July (0-indexed, so 6 is July)
    const months = {};
    
    // Create 6 months starting from July 2025
    for (let i = 0; i < 6; i++) {
        const monthDate = new Date(startYear, startMonth + i, 1);
        const monthYear = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        months[monthYear] = 0;
    }
    
    // Count billing corrections for each month
    billing.forEach(item => {
        if (!item.createdAt) return;
        const date = new Date(item.createdAt);
        const monthYear = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        
        // Only count if it's in our predefined months
        if (months[monthYear] !== undefined) {
            months[monthYear]++;
        }
    });

    return {
        labels: Object.keys(months),
        data: Object.values(months)
    };
}

// Initialize charts when the DOM is loaded
async function initializeCharts() {
    console.log('Initializing charts...');
    
    // Check if we're on the index page (which has charts)
    const issuesChartCanvas = document.getElementById('issuesChart');
    const billingChartCanvas = document.getElementById('billingChart');
    
    if (!issuesChartCanvas || !billingChartCanvas) {
        console.log('Chart canvases not found on this page, skipping chart initialization');
        return;
    }
    
    console.log('Canvas elements found, fetching data...');
    
    // Wait for fetch functions to be available
    if (typeof fetchIssues !== 'function' || typeof fetchBilling !== 'function') {
        console.log('Fetch functions not available yet, retrying...');
        setTimeout(initializeCharts, 100);
        return;
    }
    
    try {
        // Get real data from Google Sheets
        const issues = await fetchIssues();
        const billing = await fetchBilling();
        
        console.log('Chart data received:', { 
            issuesCount: issues.length, 
            billingCount: billing.length 
        });

        // Process data for charts
        const issuesData = processIssuesData(issues);
        const billingData = processBillingData(billing);
        
        console.log('Processed chart data:', { issuesData, billingData });

        if (issuesChartCanvas) {
            // Issues Chart Configuration
            const issuesChart = new Chart(issuesChartCanvas, {
                type: 'bar',
                data: {
                    labels: issuesData.labels,
                    datasets: [{
                        label: 'Issues Reported',
                        data: issuesData.data,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Monthly Issues Report'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        if (billingChartCanvas) {
            // Billing Chart Configuration
            const billingChart = new Chart(billingChartCanvas, {
                type: 'bar',
                data: {
                    labels: billingData.labels,
                    datasets: [{
                        label: 'Billing Corrections',
                        data: billingData.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Monthly Billing Corrections'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0 // Show whole numbers only
                            }
                        }
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Function to update charts with new data
function updateCharts(newIssuesData, newBillingData) {
    const issuesChart = Chart.getChart('issuesChart');
    const billingChart = Chart.getChart('billingChart');

    if (issuesChart && newIssuesData) {
        issuesChart.data.datasets[0].data = newIssuesData;
        issuesChart.update();
    }

    if (billingChart && newBillingData) {
        billingChart.data.datasets[0].data = newBillingData;
        billingChart.update();
    }
}

// Initialize charts when DOM is loaded (only on pages with charts)
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize charts if we're on a page that has chart canvases
    if (document.getElementById('issuesChart') || document.getElementById('billingChart')) {
        console.log('Charts detected, initializing...');
        // Wait a bit for all scripts to load
        setTimeout(initializeCharts, 200);
    }
});
