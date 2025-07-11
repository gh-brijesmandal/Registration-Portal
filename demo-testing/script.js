// ===================== NSA Registration Portal Script =====================
// This script manages the animated intro, navigation, and multi-step registration form.
// It handles UI transitions, form validation, dynamic field rendering, and summary display.
// --------------------------------------------------------------------------

// ===================== DOMContentLoaded: Initial Page Setup =====================
// Wait for the DOM to be fully loaded before running any scripts.
// This ensures all elements are available for manipulation.
document.addEventListener('DOMContentLoaded', function() {
    // --- Get references to key DOM elements used for intro and navigation ---
    const flagOverlay = document.getElementById('flag-overlay'); // The animated flag overlay
    const mainContent = document.getElementById('main-content'); // The main portal content

    // --- Check if the user has already visited this session (for intro animation) ---
    const hasVisited = sessionStorage.getItem('nsaVisited');

    if (!hasVisited) {
        // First visit: show intro animation and flag overlay
        sessionStorage.setItem('nsaVisited', 'true'); // Mark as visited
        flagOverlay.classList.remove('hidden'); // Show flag overlay
        mainContent.classList.add('content-appear'); // Animate main content in
        // Hide flag overlay after animation completes (4s)
        setTimeout(() => {
            flagOverlay.classList.add('hidden');
        }, 4000);
    } else {
        // Subsequent visits: skip animation, show content immediately
        flagOverlay.classList.add('hidden');
        mainContent.classList.add('immediate-show');
    }

    // --- Get references to navigation buttons and containers ---
    const registrationButton = document.getElementById('registration-form'); // Button to open registration form
    const adminButton = document.getElementById('admin-portal'); // Button to open admin panel
    const registrationContainer = document.getElementById('registration-container'); // Registration form container
    const backToHomeButton = document.getElementById('back-to-home'); // Button to return to home/portal

    // --- Show registration form when registration button is clicked ---
    if (registrationButton) {
        registrationButton.addEventListener('click', function() {
            mainContent.style.display = 'none'; // Hide main portal content
            registrationContainer.classList.remove('hidden'); // Show registration form
            initializeRegistrationForm(); // Reset and initialize form
        });
    }

    // --- Return to home/portal when back button is clicked ---
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', function() {
            registrationContainer.classList.add('hidden'); // Hide registration form
            mainContent.style.display = 'block'; // Show main portal content
            mainContent.classList.add('immediate-show'); // Show instantly
            mainContent.classList.remove('content-appear'); // Remove animation class
            flagOverlay.classList.add('hidden'); // Ensure flag overlay is hidden
        });
    }

    // --- Navigate to admin panel when admin button is clicked ---
    if (adminButton) {
        adminButton.addEventListener('click', function() {
            window.location.href = 'admin.html'; // Redirect to admin page
        });
    }
});


// ===================== Registration Form Logic =====================
// All logic below manages the multi-step registration form, including navigation, validation, and dynamic content.
// -------------------------------------------------------------------

// --- Track the current step in the form (1-based index) ---
let currentStep = 1;

// --- Store all form data as key-value pairs (fieldName: value) ---
let formData = {};


// ===================== Form Initialization =====================
// Resets the form state, shows the first step, and sets up navigation and validation.
function initializeRegistrationForm() {
    currentStep = 1; // Start at step 1
    formData = {}; // Clear previous data
    showStep(1); // Show first step only
    updateProgressBar(); // Update progress bar UI
    calculateMembershipFee(); // Show current fee and period
    setupFormNavigation(); // Attach navigation event listeners
    setupFormValidation(); // Attach validation logic
}


// ===================== Navigation: Next/Previous/Submit =====================
// Handles navigation between steps and form submission.
// -------------------- Registration Form Navigation and Submission --------------------
// This function sets up the navigation logic for the multi-step registration form.
// It attaches event listeners to the Next and Previous buttons, as well as the form submission event.
// Each step is validated before moving forward, and data is saved at each step.
function setupFormNavigation() {
    // Select all elements with the class 'btn-next' (Next buttons)
    const nextButtons = document.querySelectorAll('.btn-next');
    // Select all elements with the class 'btn-prev' (Previous buttons)
    const prevButtons = document.querySelectorAll('.btn-prev');
    // Get the registration form element by its ID
    const form = document.getElementById('nsa-registration-form');

    // -------------------- Next Step Button Logic --------------------
    // For each Next button, add a click event listener
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Validate the current step before proceeding
            if (validateCurrentStep()) {
                // Save the data entered in the current step to the formData object
                saveCurrentStepData();
                // Move to the next step
                currentStep++;
                // Show the next step in the form
                showStep(currentStep);
                // Update the progress bar to reflect the new step
                updateProgressBar();

                // Conditional logic for specific steps:
                // If the user is on step 3, set up the email step (dynamic fields)
                if (currentStep === 3) {
                    setupEmailStep();
                // If the user is on step 4, set up the details step (dynamic fields)
                } else if (currentStep === 4) {
                    setupDetailsStep();
                // If the user is on step 6, set up the confirmation step (summary)
                } else if (currentStep === 6) {
                    setupConfirmationStep();
                }
            } else {
                // If validation fails, do not proceed to the next step
                // Error messages are shown by validateCurrentStep()
            }
        });
    });

    // -------------------- Previous Step Button Logic --------------------
    // For each Previous button, add a click event listener
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Move back to the previous step
            currentStep--;
            // Show the previous step in the form
            showStep(currentStep);
            // Update the progress bar to reflect the new step
            updateProgressBar();
            // No validation needed when going back
        });
    });

    // -------------------- Form Submission Logic --------------------
    // Add a submit event listener to the form
    form.addEventListener('submit', function(e) {
        // Prevent the default form submission (page reload)
        e.preventDefault();
        // Validate the current (final) step before submitting
        if (validateCurrentStep()) {
            // Save the data from the final step
            saveCurrentStepData();
            // Submit the registration (simulate backend call)
            submitRegistration();
        } else {
            // If validation fails, do not submit
            // Error messages are shown by validateCurrentStep()
        }
    });
}
// -------------------- End Registration Form Navigation and Submission --------------------


// ===================== Step Display and Progress Bar =====================
// Only the current step is visible; progress bar shows progress.
function showStep(step) {
    const steps = document.querySelectorAll('.form-step'); // All step containers
    steps.forEach((stepEl, index) => {
        if (index + 1 === step) {
            stepEl.classList.add('active'); // Show this step
        } else {
            stepEl.classList.remove('active'); // Hide others
        }
    });
}

function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step'); // All progress bar steps
    progressSteps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active'); // Mark as complete/current
        } else {
            step.classList.remove('active'); // Mark as incomplete
        }
    });
}


// ===================== Step Validation =====================
// Checks all required fields in the current step for validity.
function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`); // Current step container
    const requiredFields = currentStepEl.querySelectorAll('[required]'); // All required fields in this step
    let isValid = true; // Assume valid unless a check fails

    requiredFields.forEach(field => {
        // --- Skip validation for hidden fields (e.g., conditional fields) ---
        if (field.offsetParent === null) {
            return;
        }

        // --- Validation logic for different field types ---
        if (field.type === 'radio') {
            // At least one radio in the group must be checked
            const radioGroup = currentStepEl.querySelectorAll(`[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                showFieldError(field, 'Please select an option');
            }
        } else if (field.type === 'checkbox') {
            // Checkbox must be checked
            if (!field.checked) {
                isValid = false;
                showFieldError(field, 'This field is required');
            }
        } else if (field.type === 'file') {
            // File input must have a file selected
            if (field.hasAttribute('required') && !field.files.length) {
                isValid = false;
                showFieldError(field, 'Please upload a file');
            }
        } else if (!field.value.trim()) {
            // Text, number, etc. must not be empty
            isValid = false;
            showFieldError(field, 'This field is required');
        } else if (field.type === 'email') {
            // Email must match pattern
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                isValid = false;
                showFieldError(field, 'Please enter a valid email address');
            }
        }

        // --- If valid, clear any previous error ---
        if (isValid) {
            clearFieldError(field);
        }
    });

    return isValid;
}


// ===================== Field Error Display =====================
// Shows or clears error messages for fields.
function showFieldError(field, message) {
    clearFieldError(field); // Remove any existing error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv); // Show error below field
    field.classList.add('error'); // Add error style
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
}


// ===================== Save Step Data =====================
// Collects all input values from the current step and stores them in formData.
function saveCurrentStepData() {
    const currentStepEl = document.getElementById(`step-${currentStep}`); // Current step container
    const inputs = currentStepEl.querySelectorAll('input, select, textarea'); // All input fields

    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
                formData[input.name] = input.value; // Only save checked value
            }
        } else if (input.type === 'file') {
            if (input.files.length > 0) {
                formData[input.name] = input.files[0]; // Save file object
            }
        } else {
            formData[input.name] = input.value; // Save text, number, select, etc.
        }
    });
}


// ===================== Dynamic Email Step =====================
// Renders email input fields based on selected category (current-msu, alumni, others).
function setupEmailStep() {
    const emailOptionsDiv = document.getElementById('email-options'); // Container for email fields
    const category = formData.category; // Selected category
    let emailHTML = '';

    if (category === 'current-msu') {
        // MSU members must use MSU email
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
        // Alumni can choose MSU or personal email
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
        // Others can use any email
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

    emailOptionsDiv.innerHTML = emailHTML; // Render the fields

    // --- Add event listeners for alumni email type selection ---
    if (category === 'alumni') {
        const emailTypeRadios = document.querySelectorAll('input[name="emailType"]');
        emailTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                setupEmailInput(this.value); // Render correct input
            });
        });
    }
}

// Renders the correct email input for alumni based on their selection
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


// ===================== Dynamic Details Step =====================
// Renders additional fields based on selected category and sub-category.
function setupDetailsStep() {
    const detailFieldsDiv = document.getElementById('detail-fields'); // Container for details fields
    const category = formData.category; // Selected category
    let detailsHTML = '';

    if (category === 'current-msu') {
        // MSU members: choose affiliation (student, faculty, staff)
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
        // Alumni: graduation, degree, etc.
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
        // Others: location, relationship, involvement
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

    detailFieldsDiv.innerHTML = detailsHTML; // Render the fields

    // --- Add event listeners for MSU affiliation if current-msu category ---
    if (category === 'current-msu') {
        const affiliationRadios = document.querySelectorAll('input[name="msuAffiliation"]');
        affiliationRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                setupAffiliationDetails(this.value); // Render correct sub-fields
            });
        });
    }
}

// Renders additional fields for MSU members based on their affiliation
function setupAffiliationDetails(affiliation) {
    const affiliationDetailsDiv = document.getElementById('affiliation-details');
    let detailsHTML = '';

    if (affiliation === 'student') {
        // Student-specific fields
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
        // Faculty-specific fields
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
        // Staff-specific fields
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

    affiliationDetailsDiv.innerHTML = detailsHTML; // Render the fields
}


// ===================== Membership Fee Calculation =====================
// Determines the current enrollment period and fee based on the date.
function calculateMembershipFee() {
    const now = new Date(); // Current date
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const day = now.getDate();

    let enrollmentPeriod = '';
    let fee = 0;

    // --- Enrollment period logic (customize as needed) ---
    if ((month === 8) || (month === 9) || (month === 10) || (month === 11) || (month === 12 && day <= 31)) {
        enrollmentPeriod = 'Fall Enrollment (Aug 1 - Sep 30)';
        fee = 25;
    } else if ((month === 1) || (month === 2) || (month === 3) || (month === 4) || (month === 5 && day <= 31)) {
        enrollmentPeriod = 'Spring Enrollment (Jan 1 - Feb 28/29)';
        fee = 15;
    } else if (month >= 6 && month <= 7) {
        enrollmentPeriod = 'Summer Enrollment (Mar 1 - Jul 31)';
        fee = 5;
    } else {
        enrollmentPeriod = 'Outside enrollment period - Will be deferred to next cycle';
        fee = 0;
    }

    // --- Update UI with calculated period and fee ---
    document.getElementById('enrollment-period').textContent = enrollmentPeriod;
    document.getElementById('membership-fee').textContent = fee > 0 ? `$${fee}` : 'See next enrollment period';
}


// ===================== Membership Type & Payment Validation =====================
// Handles showing/hiding payment section and validating file uploads.
function setupFormValidation() {
    const membershipRadios = document.querySelectorAll('input[name="membershipType"]'); // Membership type radios
    const paymentSection = document.getElementById('payment-section'); // Payment section container

    // --- Show/hide payment section based on membership type ---
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

    // --- File upload validation for payment proof ---
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


// ===================== Confirmation Step =====================
// Shows a summary of all registration data before submission.
function setupConfirmationStep() {
    const summaryDiv = document.getElementById('registration-summary'); // Summary container
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
    summaryDiv.innerHTML = summaryHTML; // Render summary
}


// ===================== Helper Functions =====================
// Get readable labels for category and membership type.
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


// ===================== Registration Submission =====================
// Simulates sending registration data to a backend and resets the form.
function submitRegistration() {
    // Show a success message (replace with backend call as needed)
    alert('Registration submitted successfully! You will receive a confirmation email shortly.');
    // Reset form and return to home
    document.getElementById('registration-container').classList.add('hidden');
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('nsa-registration-form').reset();
    currentStep = 1;
    formData = {};
}
// ===================== END OF SCRIPT =====================
