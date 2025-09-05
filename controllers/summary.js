// Summary page controller
document.addEventListener('DOMContentLoaded', function() {
    loadSummaryData();
});

function loadSummaryData() {
    const savedData = localStorage.getItem('registrationData');
    
    if (!savedData) {
        // If no data found, redirect back to form
        alert('No registration data found. Please fill out the form first.');
        window.location.href = 'registration-form';
        return;
    }
    
    const data = JSON.parse(savedData);
    const summaryContent = document.getElementById('summaryContent');
    
    // Define field labels for better display
    const fieldLabels = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        address: 'Address',
        city: 'City',
        country: 'Country',
        occupation: 'Occupation',
        interests: 'Interests/Hobbies'
    };
    
    // Country mapping for better display
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
    
    // Gender mapping for better display
    const genderMapping = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other',
        'prefer-not-to-say': 'Prefer not to say'
    };
    
    let summaryHTML = '';
    
    Object.keys(fieldLabels).forEach(key => {
        if (data[key] && data[key].trim() !== '') {
            let value = data[key];
            
            // Format specific fields
            if (key === 'country' && countryMapping[value]) {
                value = countryMapping[value];
            }
            
            if (key === 'gender' && genderMapping[value]) {
                value = genderMapping[value];
            }
            
            if (key === 'dateOfBirth') {
                value = formatDate(value);
            }
            
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-label">${fieldLabels[key]}:</div>
                    <div class="summary-value">${value}</div>
                </div>
            `;
        }
    });
    
    summaryContent.innerHTML = summaryHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function goBack() {
    // Add fade out animation
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'registration-form';
    }, 500);
}

function submitRegistration() {
    // Show loading state
    const submitBtn = document.querySelector('.btn:not(.btn-secondary)');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Simulate submission process
    setTimeout(() => {
        // Update submission status in localStorage
        const savedData = localStorage.getItem('registrationData');
        if (savedData) {
            const data = JSON.parse(savedData);
            data.submitted = true;
            data.submissionDate = new Date().toISOString();
            localStorage.setItem('registrationData', JSON.stringify(data));
        }
        
        // Add fade out animation
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'thank-you';
        }, 500);
    }, 2000); // 2 second delay to simulate server processing
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    const summaryItems = document.querySelectorAll('.summary-item');
    
    summaryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

