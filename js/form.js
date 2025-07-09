// Registration Form JavaScript
let currentStep = 1;
const totalSteps = 7;
let formData = {};

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    setupEventListeners();
    calculateMembershipFee();
    setupEmailValidation();
});

// Setup event listeners
function setupEventListeners() {
    // Category selection listener
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', handleCategoryChange);
    });

    // MSU affiliation listener
    const affiliationRadios = document.querySelectorAll('input[name="msuAffiliation"]');
    affiliationRadios.forEach(radio => {
        radio.addEventListener('change', handleAffiliationChange);
    });

    // Member type listener
    const memberTypeRadios = document.querySelectorAll('input[name="memberType"]');
    memberTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleMemberTypeChange);
    });

    // Email type listener for alumni
    const emailTypeRadios = document.querySelectorAll('input[name="emailType"]');
    emailTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleEmailTypeChange);
    });

    // Form submission
    document.getElementById('registration-form').addEventListener('submit', handleSubmit);

    // File upload validation
    const fileInput = document.getElementById('paymentProof');
    if (fileInput) {
        fileInput.addEventListener('change', validateFileUpload);
    }
}

// Navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            document.getElementById(`form-step-${currentStep}`).classList.remove('active');
            currentStep++;
            document.getElementById(`form-step-${currentStep}`).classList.add('active');
            updateProgress();
            
            // Special handling for step 7 (summary)
            if (currentStep === 7) {
                populateRegistrationSummary();
            }
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`form-step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`form-step-${currentStep}`).classList.add('active');
        updateProgress();
    }
}

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progress').style.width = progress + '%';
    
    // Update step indicators
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (i <= currentStep) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    }
    
    // Auto-scroll to active step on mobile devices
    const activeStep = document.getElementById(`step-${currentStep}`);
    if (activeStep && window.innerWidth <= 768) {
        const stepIndicators = document.querySelector('.step-indicators');
        if (stepIndicators) {
            const stepRect = activeStep.getBoundingClientRect();
            const containerRect = stepIndicators.getBoundingClientRect();
            
            // Check if the active step is not fully visible
            if (stepRect.left < containerRect.left || stepRect.right > containerRect.right) {
                // Calculate scroll position to center the active step
                const scrollLeft = activeStep.offsetLeft - (stepIndicators.clientWidth / 2) + (activeStep.clientWidth / 2);
                stepIndicators.scrollTo({
                    left: Math.max(0, scrollLeft),
                    behavior: 'smooth'
                });
            }
        }
    }
}

// Validation functions
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`form-step-${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    // Clear previous error messages
    clearErrorMessages();

    // Check required fields, but skip those that are hidden
    requiredFields.forEach(field => {
        // Skip validation for elements that are not visible (display: none or inside a hidden parent)
        if (field.offsetParent === null) {
            return;
        }

        if (!field.value.trim() && field.type !== 'radio' && field.type !== 'checkbox') {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });

    // Check radio button groups (visible ones only)
    const radioGroups = currentStepElement.querySelectorAll('input[type="radio"][required]');
    const checkedGroups = new Set();
    radioGroups.forEach(radio => {
        if (radio.offsetParent === null) {
            return;
        }
        if (radio.checked) {
            checkedGroups.add(radio.name);
        }
    });

    radioGroups.forEach(radio => {
        if (radio.offsetParent === null) {
            return;
        }
        if (!checkedGroups.has(radio.name)) {
            showFieldError(radio, 'Please select an option');
            isValid = false;
        }
    });

    // Specific validations per step
    switch (currentStep) {
        case 1:
            isValid = validateStep1() && isValid;
            break;
        case 2:
            // Step 2 only requires a category selection, which is already handled by the generic required-field check above.
            // No additional validation is necessary here.
            break;
        case 3:
            isValid = validateStep3() && isValid;
            break;
        case 4:
            isValid = validateStep4() && isValid;
            break;
        case 5:
            // Step 5 (membership type) relies on required radio inputs that are validated generically.
            // Additional custom validation is not needed at this stage.
            break;
        case 6:
            isValid = validateStep6() && isValid;
            break;
        case 7:
            isValid = validateStep7() && isValid;
            break;
    }

    return isValid;
}

function validateStep1() {
    const fullName = document.getElementById('fullName').value.trim();
    if (fullName.length < 2) {
        showFieldError(document.getElementById('fullName'), 'Please enter a valid full name');
        return false;
    }
    return true;
}

function validateStep3() {
    const email = document.getElementById('email').value;
    const category = document.querySelector('input[name="category"]:checked')?.value;
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError(document.getElementById('email'), 'Please enter a valid email address');
        return false;
    }

    // Category-specific email validation
    if (category === 'current-msu') {
        if (!email.endsWith('@msstate.edu')) {
            showFieldError(document.getElementById('email'), 'Current MSU members must use @msstate.edu email');
            return false;
        }
    }

    return true;
}

function validateStep4() {
    const category = document.querySelector('input[name="category"]:checked')?.value;
    
    if (category === 'current-msu') {
        const affiliation = document.querySelector('input[name="msuAffiliation"]:checked')?.value;
        if (!affiliation) {
            showError('Please select your MSU affiliation');
            return false;
        }

        // Validate affiliation-specific fields
        if (affiliation === 'student') {
            const level = document.querySelector('input[name="academicLevel"]:checked')?.value;
            const major = document.getElementById('major').value.trim();
            if (!level || !major) {
                showError('Please complete all student information fields');
                return false;
            }
        } else if (affiliation === 'faculty') {
            const dept = document.getElementById('facultyDepartment').value.trim();
            const position = document.getElementById('position').value.trim();
            if (!dept || !position) {
                showError('Please complete all faculty information fields');
                return false;
            }
        } else if (affiliation === 'staff') {
            const office = document.getElementById('staffOffice').value.trim();
            const role = document.getElementById('staffRole').value.trim();
            if (!office || !role) {
                showError('Please complete all staff information fields');
                return false;
            }
        }
    }

    return true;
}

function validateStep6() {
    const memberType = document.querySelector('input[name="memberType"]:checked')?.value;
    
    if (memberType === 'active') {
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            showError('Please upload proof of payment for active membership');
            return false;
        }
    }

    return true;
}

function validateStep7() {
    const agreements = document.querySelectorAll('#form-step-7 input[type="checkbox"][required]');
    for (let agreement of agreements) {
        if (!agreement.checked) {
            showError('You must agree to all terms and conditions');
            return false;
        }
    }
    return true;
}

// Category handling functions
function handleCategoryChange() {
    const selectedCategory = document.querySelector('input[name="category"]:checked')?.value;
    
    // Reset step 3 email section
    resetEmailSection();
    
    // Show/hide email type choice for alumni
    if (selectedCategory === 'alumni') {
        document.getElementById('alumni-email-choice').classList.remove('hidden');
    } else {
        document.getElementById('alumni-email-choice').classList.add('hidden');
    }

    // Update email hint
    updateEmailHint(selectedCategory);
    
    // Hide all category-specific fields
    hideAllCategoryFields();
}

function handleEmailTypeChange() {
    const emailType = document.querySelector('input[name="emailType"]:checked')?.value;
    updateEmailHint('alumni', emailType);
}

function handleAffiliationChange() {
    const affiliation = document.querySelector('input[name="msuAffiliation"]:checked')?.value;
    
    // Hide all sub-category fields
    document.querySelectorAll('.sub-category-fields').forEach(field => {
        field.classList.add('hidden');
    });

    // Show relevant fields
    if (affiliation) {
        document.getElementById(`${affiliation}-fields`).classList.remove('hidden');
    }
}

function handleMemberTypeChange() {
    const memberType = document.querySelector('input[name="memberType"]:checked')?.value;
    
    if (memberType === 'active') {
        document.getElementById('payment-section').classList.remove('hidden');
        document.getElementById('passive-message').classList.add('hidden');
        document.getElementById('paymentProof').required = true;
    } else {
        document.getElementById('payment-section').classList.add('hidden');
        document.getElementById('passive-message').classList.remove('hidden');
        document.getElementById('paymentProof').required = false;
    }
}

// Email validation and verification
function setupEmailValidation() {
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        const category = document.querySelector('input[name="category"]:checked')?.value;
        if (category && this.value) {
            showVerificationSection();
        }
    });
}

function showVerificationSection() {
    document.getElementById('verification-section').classList.remove('hidden');
}

function sendVerificationCode() {
    const email = document.getElementById('email').value;
    if (!email) {
        showError('Please enter an email address first');
        return;
    }

    // Simulate sending verification code
    const statusDiv = document.getElementById('verification-status');
    statusDiv.innerHTML = '<div class="loading">Sending verification code...</div>';
    
    setTimeout(() => {
        statusDiv.innerHTML = '<div class="success">Verification code sent to ' + email + '</div>';
        // Generate and store a dummy verification code for demo
        window.demoVerificationCode = '123456';
    }, 2000);
}

// Category field management
function hideAllCategoryFields() {
    document.querySelectorAll('.category-fields').forEach(field => {
        field.classList.add('hidden');
    });
    
    // Show relevant fields on step 4
    setTimeout(() => {
        const category = document.querySelector('input[name="category"]:checked')?.value;
        if (category && currentStep === 4) {
            document.getElementById(`${category.replace('_', '-')}-fields`).classList.remove('hidden');
        }
    }, 100);
}

function updateEmailHint(category, emailType = null) {
    const hintElement = document.getElementById('email-hint');
    
    switch (category) {
        case 'current-msu':
            hintElement.textContent = 'Must be your @msstate.edu email address';
            break;
        case 'alumni':
            if (emailType === 'msu_email') {
                hintElement.textContent = 'Use your @msstate.edu email address';
            } else if (emailType === 'personal_email') {
                hintElement.textContent = 'Your personal email address';
            } else {
                hintElement.textContent = 'Choose MSU or personal email';
            }
            break;
        case 'others':
            hintElement.textContent = 'Any valid email address';
            break;
        default:
            hintElement.textContent = '';
    }
}

function resetEmailSection() {
    document.getElementById('verification-section').classList.add('hidden');
    document.getElementById('verification-status').innerHTML = '';
    document.getElementById('verificationCode').value = '';
}

// Membership fee calculation
function calculateMembershipFee() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentDay = currentDate.getDate();
    
    let fee = 25; // Default fall fee
    let period = 'Fall 2025';
    let validUntil = 'July 31, 2026';
    
    // Determine current enrollment period and fee
    if (currentMonth >= 8 || (currentMonth === 9 && currentDay <= 30)) {
        // Fall enrollment (Aug 1 - Sep 30)
        fee = 25;
        period = 'Fall 2025';
        validUntil = 'July 31, 2026';
    } else if (currentMonth >= 1 && currentMonth <= 2) {
        // Spring enrollment (Jan 1 - Feb 28/29)
        fee = 15;
        period = 'Spring 2025';
        validUntil = 'July 31, 2025';
    } else if (currentMonth >= 3 && currentMonth <= 7) {
        // Summer enrollment (Mar 1 - Jul 31)
        fee = 5;
        period = 'Summer 2025';
        validUntil = 'July 31, 2025';
    }

    // Update UI
    document.getElementById('active-fee').textContent = `$${fee}`;
    document.getElementById('current-period').innerHTML = `
        <h4>Current Enrollment Period: ${period}</h4>
        <p>Membership Fee: $${fee}</p>
        <p>Valid Until: ${validUntil}</p>
    `;
    
    // Store for later use
    window.currentMembershipFee = fee;
    window.validUntil = validUntil;
}

// File upload validation
function validateFileUpload() {
    const fileInput = document.getElementById('paymentProof');
    const file = fileInput.files[0];
    
    if (file) {
        // Check file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            showFieldError(fileInput, 'File size must be less than 2MB');
            fileInput.value = '';
            return false;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            showFieldError(fileInput, 'Only JPG, PNG, and PDF files are allowed');
            fileInput.value = '';
            return false;
        }
    }
    
    return true;
}

// Summary population
function populateRegistrationSummary() {
    const summaryDiv = document.getElementById('registration-summary');
    const formData = collectFormData();
    
    let summaryHtml = `
        <div class="summary-item">
            <strong>Full Name:</strong> ${formData.fullName || 'Not provided'}
        </div>
        <div class="summary-item">
            <strong>Email:</strong> ${formData.email || 'Not provided'}
        </div>
        <div class="summary-item">
            <strong>Category:</strong> ${getCategoryDisplayName(formData.category)}
        </div>
    `;
    
    // Add category-specific information
    if (formData.category === 'current-msu') {
        summaryHtml += `
            <div class="summary-item">
                <strong>MSU Affiliation:</strong> ${formData.msuAffiliation || 'Not provided'}
            </div>
        `;
        
        if (formData.msuAffiliation === 'student') {
            summaryHtml += `
                <div class="summary-item">
                    <strong>Academic Level:</strong> ${formData.academicLevel || 'Not provided'}
                </div>
                <div class="summary-item">
                    <strong>Major:</strong> ${formData.major || 'Not provided'}
                </div>
            `;
        }
    }
    
    summaryHtml += `
        <div class="summary-item">
            <strong>Membership Type:</strong> ${getMemberTypeDisplayName(formData.memberType)}
        </div>
    `;
    
    if (formData.memberType === 'active') {
        summaryHtml += `
            <div class="summary-item">
                <strong>Fee Amount:</strong> $${window.currentMembershipFee || 25}
            </div>
        `;
    }
    
    summaryDiv.innerHTML = summaryHtml;
}

function collectFormData() {
    const form = document.getElementById('registration-form');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

function getCategoryDisplayName(category) {
    switch (category) {
        case 'current-msu': return 'Current MSU Student/Staff/Faculty';
        case 'alumni': return 'MSU Alumni';
        case 'others': return 'Others';
        default: return 'Not selected';
    }
}

function getMemberTypeDisplayName(memberType) {
    switch (memberType) {
        case 'active': return 'Active Member (Paid)';
        case 'passive': return 'Passive Member (Free)';
        default: return 'Not selected';
    }
}

// Form submission
function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    const formData = collectFormData();
    
    // Show loading state
    const submitButton = document.querySelector('.btn-submit');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        alert('Registration submitted successfully! You will receive a confirmation email shortly.');
        
        // Reset form or redirect
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // For demo purposes, redirect to home
        window.location.href = 'index.html';
    }, 3000);
}

// Utility functions
function showError(message) {
    // Create or update error message
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.form-step.active').insertBefore(errorDiv, document.querySelector('.button-group'));
    }
    errorDiv.textContent = message;
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showFieldError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
    
    field.classList.add('error');
}

function clearErrorMessages() {
    // Remove general error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    // Remove field-specific errors
    const fieldErrors = document.querySelectorAll('.field-error');
    fieldErrors.forEach(error => error.remove());
    
    // Remove error styling from fields
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

function goHome() {
    window.location.href = 'index.html';
}

// Handle page visibility for step management
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Update UI when user returns to tab
        updateProgress();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
    // Prevent default browser navigation within form
    if (currentStep > 1) {
        history.pushState(null, null, window.location.href);
    }
});

// Initialize history state
history.pushState(null, null, window.location.href);
