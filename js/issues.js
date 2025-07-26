// Application Issues logic
document.addEventListener('DOMContentLoaded', function() {
    const issuesList = document.getElementById('issues-list');
    const addIssueBtn = document.getElementById('add-issue');

    async function renderIssues() {
        // Show loading state
        issuesList.innerHTML = '<tr><td colspan="8">Loading issues...</td></tr>';
        
        try {
            const issues = await fetchIssues();
            issuesList.innerHTML = issues.map((issue, idx) => `
                <tr class="issue-item ${issue.status ? issue.status.toLowerCase() : ''}" data-idx="${idx}">
                    <td>${issue.date}</td>
                    <td>${issue.reporter}</td>
                    <td>${issue.department}</td>
                    <td>${issue.title}</td>
                    <td>${issue.description}</td>
                    <td>${issue.status || 'Open'}</td>
                    <td>${issue.resolveTime ? `${Math.round((new Date(issue.resolveTime) - new Date(issue.createdAt)) / (1000 * 60))}min` : '-'}</td>
                    <td>${issue.status !== 'Resolved' ? '<button class="resolve-btn">Mark as Resolved</button>' : ''}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error("Error rendering issues:", error);
            issuesList.innerHTML = '<tr><td colspan="8">Error loading issues. Please refresh the page.</td></tr>';
        }
    }

    function showIssueForm() {
        const form = document.createElement('div');
        form.className = 'form-popup';
        form.innerHTML = `
            <h3>Add Application Issue</h3>
            <label>Name:</label><input id="issue-reporter" type="text" required>
            <label>Department:</label><input id="issue-department" type="text" required>
            <label>Title:</label><input id="issue-title" type="text" required>
            <label>Description:</label><textarea id="issue-desc" required></textarea>
            <button id="save-issue">Save</button>
            <button class="close-btn">Close</button>
        `;
        document.body.appendChild(form);
        form.style.display = 'block';
        form.querySelector('.close-btn').onclick = () => { form.remove(); };
        form.querySelector('#save-issue').onclick = async () => {
            // Show saving indicator
            const saveButton = form.querySelector('#save-issue');
            const originalText = saveButton.textContent;
            saveButton.textContent = "Saving...";
            saveButton.disabled = true;
            
            try {
                // Create new issue object
                const newIssue = {
                    reporter: form.querySelector('#issue-reporter').value,
                    department: form.querySelector('#issue-department').value,
                    title: form.querySelector('#issue-title').value,
                    description: form.querySelector('#issue-desc').value,
                    date: new Date().toLocaleString(),
                    status: 'Open',
                    createdAt: new Date().toISOString()
                };
                
                // Save to Google Sheets
                await addIssue(newIssue);
                
                // Update UI
                await renderIssues();
                document.dispatchEvent(new Event('issuesUpdated'));
                
                // Directly update counters if possible
                if (typeof updateCounters === 'function') {
                    await updateCounters();
                }
                
                form.remove();
            } catch (error) {
                console.error("Error saving issue:", error);
                alert("Failed to save issue. Please try again.");
                saveButton.textContent = originalText;
                saveButton.disabled = false;
            }
        };
    }

    async function handleResolveClick(e) {
        if (e.target.classList.contains('resolve-btn')) {
            // Disable the button to prevent double-clicks
            e.target.disabled = true;
            e.target.textContent = "Updating...";
            
            try {
                const issueItem = e.target.closest('.issue-item');
                const index = issueItem.getAttribute('data-idx');
                
                // Get the latest data
                const issues = await fetchIssues();
                
                if (issues[index]) {
                    // Update the issue
                    issues[index].resolveTime = new Date().toISOString();
                    issues[index].status = 'Resolved';
                    
                    // Save to Google Sheets
                    await updateIssue(parseInt(index), issues[index]);
                    
                    // Update UI
                    await renderIssues();
                    document.dispatchEvent(new Event('issuesUpdated'));
                    
                    // Update counters to reflect the change
                    if (typeof updateCounters === 'function') {
                        updateCounters();
                    }
                }
            } catch (error) {
                console.error("Error resolving issue:", error);
                alert("Failed to mark issue as resolved. Please try again.");
                e.target.disabled = false;
                e.target.textContent = "Mark as Resolved";
            }
        }
    }

    addIssueBtn.onclick = showIssueForm;
    issuesList.addEventListener('click', handleResolveClick);
    renderIssues();
    
    // Ensure metrics are updated
    if (typeof updateCounters === 'function') {
        updateCounters().then(() => {
            console.log('Issue metrics updated on page load');
        }).catch(error => {
            console.error('Error updating issue metrics:', error);
        });
    }
});