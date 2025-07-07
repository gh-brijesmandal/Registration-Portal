// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const flagOverlay = document.getElementById('flag-overlay');
    const mainContent = document.getElementById('main-content');
    
    // Check if this is a fresh navigation (not a reload)
    const navEntry = performance.getEntriesByType("navigation")[0];
    const isFirstVisit = navEntry && navEntry.type === 'navigate';
    
    if (isFirstVisit) {
        // Show flag animation for first visit
        flagOverlay.classList.remove('hidden');
        mainContent.classList.add('content-appear');
        
        // Hide flag overlay after animation completes
        setTimeout(() => {
            flagOverlay.classList.add('hidden');
        }, 4000);
        
    } else {
        // For reloads, show content immediately
        flagOverlay.classList.add('hidden');
        mainContent.classList.add('immediate-show');
    }
    
    // Add click handlers for buttons
    const registrationButton = document.getElementById('registration-form');
    const adminButton = document.getElementById('admin-portal');
    const registrationContainer = document.getElementById('registration-container');
    const backToHomeButton = document.getElementById('back-to-home');
    
    if (registrationButton) {
        registrationButton.addEventListener('click', function() {
            // Hide main content and show registration form
            mainContent.style.display = 'none';
            registrationContainer.classList.remove('hidden');
            initializeRegistrationForm();
        });
    }
    
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', function() {
            // Show main content and hide registration form
            registrationContainer.classList.add('hidden');
            mainContent.style.display = 'block';
        });
    }
    
    if (adminButton) {
        adminButton.addEventListener('click', function() {
            window.location.href = 'admin.html';
        });
    }
});

// Registration Form Variables
let currentStep = 1;
let formData = {};

// Initialize Registration Form
function initializeRegistrationForm() {
    currentStep = 1;
    formData = {};
    showStep(1);
    updateProgressBar();
    calculateMembershipFee();
    
    // Add event listeners for form navigation
    setupFormNavigation();
    setupFormValidation();
}

// Form Navigation Setup
function setupFormNavigation() {
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const form = document.getElementById('nsa-registration-form');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateCurrentStep()) {
                saveCurrentStepData();
                currentStep++;
                showStep(currentStep);
                updateProgressBar();
                
                // Handle conditional logic for specific steps
                if (currentStep === 3) {
                    setupEmailStep();
                } else if (currentStep === 4) {
                    setupDetailsStep();
                } else if (currentStep === 6) {
                    setupConfirmationStep();
                }
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentStep--;
            showStep(currentStep);
            updateProgressBar();
        });
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateCurrentStep()) {
            saveCurrentStepData();
            submitRegistration();
        }
    });
}

// Show specific step
function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((stepEl, index) => {
        if (index + 1 === step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

// Update progress bar
function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Validate current step
function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (field.type === 'radio') {
            const radioGroup = currentStepEl.querySelectorAll(`[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                showFieldError(field, 'Please select an option');
            }
        } else if (field.type === 'checkbox') {
            if (!field.checked) {
                isValid = false;
                showFieldError(field, 'This field is required');
            }
        } else if (field.type === 'file') {
            if (field.hasAttribute('required') && !field.files.length) {
                isValid = false;
                showFieldError(field, 'Please upload a file');
            }
        } else if (!field.value.trim()) {
            isValid = false;
            showFieldError(field, 'This field is required');
        } else if (field.type === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                isValid = false;
                showFieldError(field, 'Please enter a valid email address');
            }
        }
        
        if (isValid) {
            clearFieldError(field);
        }
    });
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
}

// Clear field error
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
}

// Save current step data
function saveCurrentStepData() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else if (input.type === 'file') {
            if (input.files.length > 0) {
                formData[input.name] = input.files[0];
            }
        } else {
            formData[input.name] = input.value;
        }
    });
}

// Setup email step based on selected category
function setupEmailStep() {
    const emailOptionsDiv = document.getElementById('email-options');
    const category = formData.category;
    
    let emailHTML = '';
    
    if (category === 'current-msu') {
        emailHTML = `
            <label for="msu-email">MSU Email Address *</label>
            <input type="email" id="msu-email" name="email" required pattern=".*@msstate\\.edu$">
            <p class="field-info">Must be a valid @msstate.edu email address</p>
            <div id="verification-section" class="hidden">
                <label for="verification-code">Verification Code *</label>
                <input type="text" id="verification-code" name="verificationCode" required>
                <button type="button" id="send-verification" class="btn-secondary">Send Verification Code</button>
            </div>
        `;
    } else if (category === 'alumni') {
        emailHTML = `
            <div class="radio-group">
                <label class="radio-label">
                    <input type="radio" name="emailType" value="msu" required>
                    <span class="radio-custom"></span>
                    Use MSU Email (@msstate.edu)
                </label>
                <label class="radio-label">
                    <input type="radio" name="emailType" value="personal" required>
                    <span class="radio-custom"></span>
                    Use Personal Email
                </label>
            </div>
            <div id="email-input-section">
                <!-- Email input will be added dynamically -->
            </div>
        `;
    } else if (category === 'others') {
        emailHTML = `
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" required>
            <div id="verification-section" class="hidden">
                <label for="verification-code">Verification Code *</label>
                <input type="text" id="verification-code" name="verificationCode" required>
                <button type="button" id="send-verification" class="btn-secondary">Send Verification Code</button>
            </div>
        `;
    }
    
    emailOptionsDiv.innerHTML = emailHTML;
    
    // Add event listeners for alumni email type selection
    if (category === 'alumni') {
        const emailTypeRadios = document.querySelectorAll('input[name="emailType"]');
        emailTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                setupEmailInput(this.value);
            });
        });
    }
}

// Setup email input for alumni
function setupEmailInput(emailType) {
    const emailInputSection = document.getElementById('email-input-section');
    let inputHTML = '';
    
    if (emailType === 'msu') {
        inputHTML = `
            <label for="email">MSU Email Address *</label>
            <input type="email" id="email" name="email" required pattern=".*@msstate\\.edu$">
            <p class="field-info">Must be a valid @msstate.edu email address</p>
        `;
    } else {
        inputHTML = `
            <label for="email">Personal Email Address *</label>
            <input type="email" id="email" name="email" required>
            <p class="field-info">Your registration will be pending manual verification</p>
        `;
    }
    
    emailInputSection.innerHTML = inputHTML;
}

// Setup details step based on category
function setupDetailsStep() {
    const detailFieldsDiv = document.getElementById('detail-fields');
    const category = formData.category;
    
    let detailsHTML = '';
    
    if (category === 'current-msu') {
        detailsHTML = `
            <div class="radio-group">
                <label class="radio-label">
                    <input type="radio" name="msuAffiliation" value="student" required>
                    <span class="radio-custom"></span>
                    Student
                </label>
                <label class="radio-label">
                    <input type="radio" name="msuAffiliation" value="faculty" required>
                    <span class="radio-custom"></span>
                    Faculty
                </label>
                <label class="radio-label">
                    <input type="radio" name="msuAffiliation" value="staff" required>
                    <span class="radio-custom"></span>
                    Staff
                </label>
            </div>
            <div id="affiliation-details">
                <!-- Will be populated based on selection -->
            </div>
        `;
    } else if (category === 'alumni') {
        detailsHTML = `
            <div class="form-group">
                <label for="graduation-year">Year of Graduation *</label>
                <input type="number" id="graduation-year" name="graduationYear" required min="1950" max="2030">
            </div>
            <div class="form-group">
                <label for="degree-earned">Degree Earned *</label>
                <input type="text" id="degree-earned" name="degreeEarned" required>
            </div>
            <div class="form-group">
                <label for="department-major">Department/Major *</label>
                <input type="text" id="department-major" name="departmentMajor" required>
            </div>
            <div class="form-group">
                <label for="current-country">Current Country *</label>
                <input type="text" id="current-country" name="currentCountry" required>
            </div>
            <div class="form-group">
                <label for="current-state">Current State *</label>
                <input type="text" id="current-state" name="currentState" required>
            </div>
            <div class="form-group">
                <label for="current-profession">Current Profession *</label>
                <input type="text" id="current-profession" name="currentProfession" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="support-nsa" name="supportNSA">
                    <span class="checkbox-custom"></span>
                    I am interested in supporting NSA
                </label>
            </div>
        `;
    } else if (category === 'others') {
        detailsHTML = `
            <div class="form-group">
                <label for="country-city">Country and City *</label>
                <input type="text" id="country-city" name="countryCity" required>
            </div>
            <div class="form-group">
                <label for="nsa-relationship">Relationship with NSA *</label>
                <select id="nsa-relationship" name="nsaRelationship" required>
                    <option value="">Select...</option>
                    <option value="family">Family of current/former member</option>
                    <option value="friend">Friend of NSA</option>
                    <option value="community">Community member</option>
                    <option value="professional">Professional connection</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Interest in involvement:</label>
                <div class="checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="involvement" value="volunteering">
                        <span class="checkbox-custom"></span>
                        Volunteering
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="involvement" value="support">
                        <span class="checkbox-custom"></span>
                        Financial Support
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="involvement" value="events">
                        <span class="checkbox-custom"></span>
                        Event Participation
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="involvement" value="mentoring">
                        <span class="checkbox-custom"></span>
                        Mentoring
                    </label>
                </div>
            </div>
        `;
    }
    
    detailFieldsDiv.innerHTML = detailsHTML;
    
    // Add event listeners for MSU affiliation if current-msu category
    if (category === 'current-msu') {
        const affiliationRadios = document.querySelectorAll('input[name="msuAffiliation"]');
        affiliationRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                setupAffiliationDetails(this.value);
            });
        });
    }
}

// Setup affiliation details for current MSU members
function setupAffiliationDetails(affiliation) {
    const affiliationDetailsDiv = document.getElementById('affiliation-details');
    let detailsHTML = '';
    
    if (affiliation === 'student') {
        detailsHTML = `
            <div class="form-group">
                <label for="student-level">Level *</label>
                <select id="student-level" name="studentLevel" required>
                    <option value="">Select...</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                </select>
            </div>
            <div class="form-group">
                <label for="major-department">Major/Department *</label>
                <input type="text" id="major-department" name="majorDepartment" required>
            </div>
            <div class="form-group">
                <label for="graduation-semester">Expected Graduation Semester *</label>
                <select id="graduation-semester" name="graduationSemester" required>
                    <option value="">Select...</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                </select>
            </div>
            <div class="form-group">
                <label for="graduation-year">Expected Graduation Year *</label>
                <input type="number" id="graduation-year" name="graduationYear" required min="2025" max="2035">
            </div>
        `;
    } else if (affiliation === 'faculty') {
        detailsHTML = `
            <div class="form-group">
                <label for="department">Department *</label>
                <input type="text" id="department" name="department" required>
            </div>
            <div class="form-group">
                <label for="position-title">Position/Title *</label>
                <input type="text" id="position-title" name="positionTitle" required>
            </div>
            <div class="form-group">
                <label for="years-at-msu">Years at MSU *</label>
                <input type="number" id="years-at-msu" name="yearsAtMSU" required min="0" max="50">
            </div>
        `;
    } else if (affiliation === 'staff') {
        detailsHTML = `
            <div class="form-group">
                <label for="office-department">Office/Department *</label>
                <input type="text" id="office-department" name="officeDepartment" required>
            </div>
            <div class="form-group">
                <label for="role-position">Role/Position *</label>
                <input type="text" id="role-position" name="rolePosition" required>
            </div>
            <div class="form-group">
                <label for="years-at-msu">Years at MSU *</label>
                <input type="number" id="years-at-msu" name="yearsAtMSU" required min="0" max="50">
            </div>
        `;
    }
    
    affiliationDetailsDiv.innerHTML = detailsHTML;
}

// Calculate membership fee based on current date
function calculateMembershipFee() {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const day = now.getDate();
    
    let enrollmentPeriod = '';
    let fee = 0;
    
    if ((month === 8) || (month === 9) || (month === 9 && day <= 30)) {
        enrollmentPeriod = 'Fall Enrollment (Aug 1 - Sep 30)';
        fee = 25;
    } else if ((month === 1) || (month === 2) || (month === 2 && day <= 29)) {
        enrollmentPeriod = 'Spring Enrollment (Jan 1 - Feb 28/29)';
        fee = 15;
    } else if (month >= 3 && month <= 7) {
        enrollmentPeriod = 'Summer Enrollment (Mar 1 - Jul 31)';
        fee = 5;
    } else {
        enrollmentPeriod = 'Outside enrollment period - Will be deferred to next cycle';
        fee = 0;
    }
    
    document.getElementById('enrollment-period').textContent = enrollmentPeriod;
    document.getElementById('membership-fee').textContent = fee > 0 ? `$${fee}` : 'See next enrollment period';
}

// Setup form validation
function setupFormValidation() {
    // Membership type selection
    const membershipRadios = document.querySelectorAll('input[name="membershipType"]');
    const paymentSection = document.getElementById('payment-section');
    
    membershipRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'active') {
                paymentSection.classList.remove('hidden');
                document.getElementById('payment-proof').setAttribute('required', 'required');
            } else {
                paymentSection.classList.add('hidden');
                document.getElementById('payment-proof').removeAttribute('required');
            }
        });
    });
    
    // File upload validation
    const fileInput = document.getElementById('payment-proof');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Check file size (2MB limit)
                if (file.size > 2 * 1024 * 1024) {
                    showFieldError(this, 'File size must be less than 2MB');
                    this.value = '';
                    return;
                }
                
                // Check file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                if (!allowedTypes.includes(file.type)) {
                    showFieldError(this, 'Only JPG, PNG, and PDF files are allowed');
                    this.value = '';
                    return;
                }
                
                clearFieldError(this);
            }
        });
    }
}

// Setup confirmation step
function setupConfirmationStep() {
    const summaryDiv = document.getElementById('registration-summary');
    
    let summaryHTML = '<h4>Registration Summary</h4>';
    summaryHTML += `<p><strong>Name:</strong> ${formData.fullName || 'Not provided'}</p>`;
    summaryHTML += `<p><strong>Category:</strong> ${getCategoryLabel(formData.category)}</p>`;
    summaryHTML += `<p><strong>Email:</strong> ${formData.email || 'Not provided'}</p>`;
    summaryHTML += `<p><strong>Membership Type:</strong> ${getMembershipTypeLabel(formData.membershipType)}</p>`;
    
    // Add category-specific details
    if (formData.category === 'current-msu') {
        summaryHTML += `<p><strong>MSU Affiliation:</strong> ${formData.msuAffiliation || 'Not provided'}</p>`;
        if (formData.majorDepartment) {
            summaryHTML += `<p><strong>Major/Department:</strong> ${formData.majorDepartment}</p>`;
        }
    } else if (formData.category === 'alumni') {
        if (formData.graduationYear) {
            summaryHTML += `<p><strong>Graduation Year:</strong> ${formData.graduationYear}</p>`;
        }
        if (formData.degreeEarned) {
            summaryHTML += `<p><strong>Degree:</strong> ${formData.degreeEarned}</p>`;
        }
    }
    
    summaryDiv.innerHTML = summaryHTML;
}

// Helper functions
function getCategoryLabel(category) {
    const labels = {
        'current-msu': 'Current MSU Student/Staff/Faculty',
        'alumni': 'MSU Alumni',
        'others': 'Others'
    };
    return labels[category] || category;
}

function getMembershipTypeLabel(type) {
    const labels = {
        'active': 'Active Member (Paid)',
        'passive': 'Passive Member (Free)'
    };
    return labels[type] || type;
}

// Submit registration
function submitRegistration() {
    // Here you would normally send the data to your backend
    // For now, we'll just show a success message
    
    alert('Registration submitted successfully! You will receive a confirmation email shortly.');
    
    // Reset form and go back to home
    document.getElementById('registration-container').classList.add('hidden');
    document.getElementById('main-content').style.display = 'block';
    
    // Reset form
    document.getElementById('nsa-registration-form').reset();
    currentStep = 1;
    formData = {};
}
