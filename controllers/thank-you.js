// Thank you page controller
document.addEventListener('DOMContentLoaded', function() {
    loadRegistrationDetails();
    addSuccessAnimation();
});

function loadRegistrationDetails() {
    const savedData = localStorage.getItem('registrationData');
    console.log(savedData);
    if (!savedData) {
        // If no data found, redirect to home
        window.location.href = 'index';
        return;
    }
    
    const data = JSON.parse(savedData);
    const detailsContainer = document.getElementById('registrationDetails');
    
    // Generate a registration ID based on timestamp and email
    const registrationId = generateRegistrationId(data);
    
    const detailsHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
            <h3 style="color: #667eea; margin-bottom: 15px;">Registration Details</h3>
            <p><strong>Registration ID:</strong> ${registrationId}</p>
            <p><strong>Name:</strong> ${data.fullName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Submission Date:</strong> ${formatDateTime(data.submissionDate)}</p>
        </div>
    `;
    
    detailsContainer.innerHTML = detailsHTML;
}

function generateRegistrationId(data) {
    const timestamp = new Date().getTime();
    return `REG-${data.fullName}-${data.membershipType}-${timestamp}`;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    return date.toLocaleDateString('en-US', options);
}

function addSuccessAnimation() {
    const successIcon = document.querySelector('.success-icon');
    const thankYouContainer = document.querySelector('.thank-you-container');
    
    // Initial state
    thankYouContainer.style.opacity = '0';
    thankYouContainer.style.transform = 'translateY(30px)';
    thankYouContainer.style.transition = 'all 0.6s ease';
    
    successIcon.style.transform = 'scale(0)';
    successIcon.style.transition = 'transform 0.5s ease';
    
    // Animate in
    setTimeout(() => {
        thankYouContainer.style.opacity = '1';
        thankYouContainer.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        successIcon.style.transform = 'scale(1)';
    }, 400);
    
    // Add bounce effect to success icon
    setTimeout(() => {
        successIcon.style.animation = 'bounce 0.6s ease';
    }, 900);
}

function startNewRegistration() {
    // Clear the current registration data
    if (confirm('Are you sure you want to start a new registration? This will clear the current data.')) {
        localStorage.removeItem('registrationData');
        
        // Add fade out animation
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'index';
        }, 500);
    }
}

function downloadSummary() {
    const savedData = localStorage.getItem('registrationData');
    
    if (!savedData) {
        alert('No registration data found.');
        return;
    }
    
    const data = JSON.parse(savedData);
    const registrationId = generateRegistrationId(data.email, data.submissionDate);
    
    // Create a formatted summary
    const summary = `
REGISTRATION SUMMARY
====================

Registration ID: ${registrationId}
Submission Date: ${formatDateTime(data.submissionDate)}

PERSONAL INFORMATION
--------------------
Name: ${data.fullName}
Email: ${data.email}
Membership Type: ${data.membershipType}
Role: ${data.msuRole}

Thank you for your registration!
    `.trim();
    
    // Create and download the file
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Registration_Summary_${registrationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Add bounce animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0) scale(1);
        }
        40% {
            transform: translateY(-10px) scale(1.1);
        }
        80% {
            transform: translateY(-5px) scale(1.05);
        }
    }
`;
document.head.appendChild(style);
