// Admin panel controller
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
});

function loadAdminData() {
    // For demo purposes, we'll simulate multiple registrations
    // In a real application, this would fetch from a server/database
    
    const savedData = localStorage.getItem('registrationData');
    const allRegistrations = [];
    
    // Add the current registration if it exists
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.submitted) {
            allRegistrations.push(data);
        }
    }
    
    // Add some demo registrations for demonstration
    const demoRegistrations = generateDemoRegistrations();
    allRegistrations.push(...demoRegistrations);
    
    updateStatistics(allRegistrations);
    displayRegistrations(allRegistrations);
}

function generateDemoRegistrations() {
    const demoData = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1-555-0123',
            city: 'New York',
            country: 'us',
            submissionDate: new Date(Date.now() - 86400000).toISOString() // Yesterday
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1-555-0456',
            city: 'Los Angeles',
            country: 'us',
            submissionDate: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        },
        {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            phone: '+44-20-7946-0958',
            city: 'London',
            country: 'uk',
            submissionDate: new Date().toISOString() // Today
        }
    ];
    
    return demoData;
}

function updateStatistics(registrations) {
    const total = registrations.length;
    
    // Calculate today's registrations
    const today = new Date().toDateString();
    const todayCount = registrations.filter(reg => 
        new Date(reg.submissionDate).toDateString() === today
    ).length;
    
    // Calculate this week's registrations
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekCount = registrations.filter(reg => 
        new Date(reg.submissionDate) >= oneWeekAgo
    ).length;
    
    document.getElementById('totalRegistrations').textContent = total;
    document.getElementById('todayRegistrations').textContent = todayCount;
    document.getElementById('thisWeekRegistrations').textContent = thisWeekCount;
}

function displayRegistrations(registrations) {
    const container = document.getElementById('registrationsContainer');
    
    if (registrations.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <h3>No registrations found</h3>
                <p>Registration data will appear here once users submit the form.</p>
            </div>
        `;
        return;
    }
    
    // Sort registrations by submission date (most recent first)
    registrations.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    let tableHTML = `
        <h3>Recent Registrations</h3>
        <table class="registrations-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Registration Date</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const countryMapping = {
        'us': 'United States',
        'uk': 'United Kingdom',
        'ca': 'Canada',
        'au': 'Australia',
        'in': 'India',
        'de': 'Germany',
        'fr': 'France',
        'other': 'Other'
    };
    
    registrations.forEach(reg => {
        const countryName = countryMapping[reg.country] || reg.country || 'Not specified';
        const formattedDate = formatDateTime(reg.submissionDate);
        
        tableHTML += `
            <tr>
                <td>${reg.fullName}</td>
                <td>${reg.email}</td>
                <td>${reg.phone || 'Not provided'}</td>
                <td>${reg.city || 'Not provided'}</td>
                <td>${countryName}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function refreshData() {
    const refreshBtn = document.querySelector('button[onclick="refreshData()"]');
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        loadAdminData();
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
    }, 1000);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all registration data? This action cannot be undone.')) {
        localStorage.removeItem('registrationData');
        
        // Reset statistics
        document.getElementById('totalRegistrations').textContent = '0';
        document.getElementById('todayRegistrations').textContent = '0';
        document.getElementById('thisWeekRegistrations').textContent = '0';
        
        // Clear table
        document.getElementById('registrationsContainer').innerHTML = `
            <div class="no-data">
                <h3>All data cleared</h3>
                <p>All registration data has been removed.</p>
            </div>
        `;
        
        alert('All registration data has been cleared.');
    }
}

function exportData() {
    const savedData = localStorage.getItem('registrationData');
    const allRegistrations = [];
    
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.submitted) {
            allRegistrations.push(data);
        }
    }
    
    // Add demo data
    allRegistrations.push(...generateDemoRegistrations());
    
    if (allRegistrations.length === 0) {
        alert('No data to export.');
        return;
    }
    
    // Convert to CSV format
    const headers = ['Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Address', 'City', 'Country', 'Occupation', 'Interests', 'Registration Date'];
    let csvContent = headers.join(',') + '\n';
    
    allRegistrations.forEach(reg => {
        const row = [
            `"${reg.firstName} ${reg.lastName}"`,
            `"${reg.email}"`,
            `"${reg.phone || ''}"`,
            `"${reg.dateOfBirth || ''}"`,
            `"${reg.gender || ''}"`,
            `"${reg.address || ''}"`,
            `"${reg.city || ''}"`,
            `"${reg.country || ''}"`,
            `"${reg.occupation || ''}"`,
            `"${reg.interests || ''}"`,
            `"${formatDateTime(reg.submissionDate)}"`
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Registration_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function goToHome() {
    window.location.href = 'index';
}
