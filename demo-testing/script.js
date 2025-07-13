// ===================== NSA Registration Portal Script =====================
// This script manages the animated intro, navigation, and multi-step registration form.
// It handles UI transitions, form validation, dynamic field rendering, and summary display.
// --------------------------------------------------------------------------
// Insert strict mode directive to enforce safer JavaScript features
"use strict";

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
        });    }
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
    
    // Load saved data into form fields from the current step
    loadSavedFormData();
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
    // Guard against missing form element to avoid runtime errors in environments where the
    // registration template has not been rendered yet (e.g. other pages that still load this script).
    if (!form) {
        console.error('setupFormNavigation: #nsa-registration-form element not found – navigation listeners not attached.');
        return;
    }

    // -------------------- Enter Key Press Logic --------------------
    // Add global Enter key listener to the form for next step functionality
    form.addEventListener('keydown', function(e) {
        // Check if Enter key was pressed
        if (e.key === 'Enter') {
            // Prevent default form submission
            e.preventDefault();
            
            // Only proceed if we're not on the last step (step 6 is confirmation/submit)
            if (currentStep < 6) {
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
                }
                // If validation fails, do not proceed (error messages are shown by validateCurrentStep())
            } else if (currentStep === 6) {
                // On the final step, Enter key should submit the form
                if (validateCurrentStep()) {
                    saveCurrentStepData();
                    submitRegistration();
                }
            }
        }
    });

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
        
        // Ensure we're on the final step (6) before submitting
        if (currentStep !== 6) {
            // If not on the final step, show an error message
            alert('Please complete all steps before submitting');
            return;
        }
        
        // Validate the current (final) step before submitting
        if (validateCurrentStep()) {
            // Save the data from the final step
            saveCurrentStepData();
            // Submit the registration (simulate backend call)
            submitRegistration();
        } else {
            // If validation fails, do not submit
            // Error messages are shown by validateCurrentStep()
            console.log('Form validation failed on final step');
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
            } else {
                clearFieldError(field); // Clear error if valid
            }
        } else if (field.type === 'checkbox' && field.hasAttribute('required')) {
            // Required checkbox must be checked
            if (!field.checked) {
                isValid = false;
                showFieldError(field, 'This field is required');
            } else {
                clearFieldError(field); // Clear error if valid
            }
        } else if (field.type === 'file') {
            // File input must have a file selected
            if (field.hasAttribute('required') && !field.files.length) {
                isValid = false;
                showFieldError(field, 'Please upload a file');
            } else {
                clearFieldError(field); // Clear error if valid
            }
        } else if (!field.value.trim()) {
            // Text, number, etc. must not be empty
            isValid = false;
            showFieldError(field, 'This field is required');
        } else if (field.type === 'email') {
            // Email must match pattern
            if (field.hasAttribute('pattern')) {
                // Use pattern attribute if provided (for MSU email validation)
                const pattern = new RegExp(field.getAttribute('pattern'));
                if (!pattern.test(field.value)) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid MSU email address (@msstate.edu)');
                } else {
                    clearFieldError(field); // Clear error if valid
                }
            } else {
                // General email validation
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid email address');
                } else {
                    clearFieldError(field); // Clear error if valid
                }
            }
        } else {
            clearFieldError(field); // Clear error if valid
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
    
    // Handle radio buttons and checkboxes (show error after the last item in group)
    if (field.type === 'radio' || field.type === 'checkbox') {
        const fieldName = field.name;
        const radioGroup = document.querySelectorAll(`[name="${fieldName}"]`);
        const lastField = radioGroup[radioGroup.length - 1];
        
        // Find the closest parent with proper structure to add error
        let parent = lastField.closest('.radio-group, .checkbox-group') || lastField.parentNode;
        parent.appendChild(errorDiv);
        
        // Add error class to all radios/checkboxes in group
        radioGroup.forEach(input => {
            input.classList.add('error');
        });
    } else {
        field.parentNode.appendChild(errorDiv); // Show error below field
        field.classList.add('error'); // Add error style
    }
}

function clearFieldError(field) {
    let container;
    
    // Handle radio buttons and checkboxes (clear all errors for the group)
    if (field.type === 'radio' || field.type === 'checkbox') {
        const fieldName = field.name;
        const inputGroup = document.querySelectorAll(`[name="${fieldName}"]`);
        
        // Find the closest parent containing all items in the group
        container = field.closest('.radio-group, .checkbox-group') || field.parentNode;
        
        // Remove error class from all inputs in group
        inputGroup.forEach(input => {
            input.classList.remove('error');
        });
    } else {
        container = field.parentNode;
        field.classList.remove('error');
    }
    
    // Remove any error message
    const existingError = container.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}


// ===================== Save Step Data =====================
// Collects all input values from the current step and stores them in formData.
function saveCurrentStepData() {
    const currentStepEl = document.getElementById(`step-${currentStep}`); // Current step container
    const inputs = currentStepEl.querySelectorAll('input, select, textarea'); // All input fields

    inputs.forEach(input => {
        // Skip disabled or hidden fields
        if (input.disabled || (input.type !== 'hidden' && input.offsetParent === null)) {
            return;
        }
        
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value; // Only save checked value
                // Store in session storage for persistence
                sessionStorage.setItem(`nsa_form_${input.name}`, input.value);
            }
        } else if (input.type === 'checkbox') {
            // For checkboxes, we need special handling as multiple can be checked
            if (input.checked) {
                // If this is a checkbox group (multiple checkboxes with same name)
                if (document.querySelectorAll(`input[type="checkbox"][name="${input.name}"]`).length > 1) {
                    if (!formData[input.name]) {
                        formData[input.name] = [];
                    }
                    formData[input.name].push(input.value);
                    
                    // Store in session storage - convert array to JSON string
                    const existingData = sessionStorage.getItem(`nsa_form_${input.name}`);
                    const dataArray = existingData ? JSON.parse(existingData) : [];
                    if (!dataArray.includes(input.value)) {
                        dataArray.push(input.value);
                    }
                    sessionStorage.setItem(`nsa_form_${input.name}`, JSON.stringify(dataArray));
                } else {
                    // Single checkbox
                    formData[input.name] = input.value;
                    sessionStorage.setItem(`nsa_form_${input.name}`, input.value);
                }
            } else if (document.querySelectorAll(`input[type="checkbox"][name="${input.name}"]`).length === 1) {
                // Single unchecked checkbox should be null/false
                formData[input.name] = false;
                sessionStorage.removeItem(`nsa_form_${input.name}`);
            }
        } else if (input.type === 'file') {
            if (input.files.length > 0 && input.files.length <= 2) {
                formData[input.name] = input.files[0]; // Save file object
                // We can't store files in sessionStorage, so we just record that a file was selected
                sessionStorage.setItem(`nsa_form_${input.name}_selected`, 'true');
            }
        } else {
            formData[input.name] = input.value; // Save text, number, select, etc.
            // Store in session storage
            sessionStorage.setItem(`nsa_form_${input.name}`, input.value);
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
            <div class="form-group">
                <label for="msu-email">MSU Email Address *</label>
                <input type="email" id="msu-email" name="email" required 
                    pattern="^[\\w.%+-]+@msstate\\.edu$">
                <p class="field-info">Must be a valid @msstate.edu email address</p>
                <div id="verification-section" class="hidden">
                    <label for="verification-code">Verification Code *</label>
                    <input type="text" id="verification-code" name="verificationCode">
                    <button type="button" id="send-verification" class="btn-secondary">Send Verification Code</button>
                </div>
            </div>
        `;
    } else if (category === 'alumni') {
        // Alumni can choose MSU or personal email
        emailHTML = `
            <div class="form-group">
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
            </div>
            <div id="email-input-section" class="form-group">
                <!-- Email input will be added dynamically -->
            </div>
        `;
    } else if (category === 'others') {
        // Others can use any email
        emailHTML = `
            <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" name="email" required>
                <div id="verification-section" class="hidden">
                    <label for="verification-code">Verification Code *</label>
                    <input type="text" id="verification-code" name="verificationCode">
                    <button type="button" id="send-verification" class="btn-secondary">Send Verification Code</button>
                </div>
            </div>
        `;
    }

    emailOptionsDiv.innerHTML = emailHTML; // Render the fields

    // --- Add event listeners for alumni email type selection ---
    if (category === 'alumni') {
        const emailTypeRadios = document.querySelectorAll('input[name="emailType"]');
        
        // Check if we have saved data
        const savedEmailType = sessionStorage.getItem('nsa_form_emailType');
        if (savedEmailType) {
            // Check the appropriate radio button
            emailTypeRadios.forEach(radio => {
                if (radio.value === savedEmailType) {
                    radio.checked = true;
                    setupEmailInput(savedEmailType); // Render correct input
                }
            });
        }
        
        // Add change listeners
        emailTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                setupEmailInput(this.value); // Render correct input
            });
        });
    }
    
    // Restore saved email if it exists
    const savedEmail = sessionStorage.getItem('nsa_form_email');
    if (savedEmail && (document.getElementById('email') || document.getElementById('msu-email'))) {
        const emailInput = document.getElementById('email') || document.getElementById('msu-email');
        emailInput.value = savedEmail;
    }
}

// Renders the correct email input for alumni based on their selection
function setupEmailInput(emailType) {
    const emailInputSection = document.getElementById('email-input-section');
    let inputHTML = '';

    if (emailType === 'msu') {
        inputHTML = `
            <div class="form-group">
                <label for="email">MSU Email Address *</label>
                <input type="email" id="email" name="email" required 
                    pattern="^[\\w.%+-]+@msstate\\.edu$">
                <p class="field-info">Must be a valid @msstate.edu email address</p>
            </div>
        `;
    } else {
        inputHTML = `
            <div class="form-group">
                <label for="email">Personal Email Address *</label>
                <input type="email" id="email" name="email" required>
                <p class="field-info">Your registration will be pending manual verification</p>
            </div>
        `;
    }

    emailInputSection.innerHTML = inputHTML;
    
    // Restore saved email if it exists
    const savedEmail = sessionStorage.getItem('nsa_form_email');
    if (savedEmail && document.getElementById('email')) {
        document.getElementById('email').value = savedEmail;
    }
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
        enrollmentPeriod = 'Fall Enrollment (Aug 1 - Dec 31)';
        fee = 25;
    } else if ((month === 1) || (month === 2) || (month === 3) || (month === 4) || (month === 5 && day <= 31)) {
        enrollmentPeriod = 'Spring Enrollment (Jan 1 - May 31)';
        fee = 15;
    } else if (month >= 6 && month <= 7) {
        enrollmentPeriod = 'Summer Enrollment (June 1 - Jul 31)';
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
    try {
        // Log the data (for debugging and demo purposes)
        console.log('Submitting registration data:', formData);
        
        // Show a success message (replace with backend call as needed)
        alert('Registration submitted successfully! You will receive a confirmation email shortly.');
        
        // Clear all saved form data
        clearSavedFormData();
        
        // Reset form and return to home
        document.getElementById('registration-container').classList.add('hidden');
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('main-content').classList.add('immediate-show'); 
        
        // Reset the form
        const form = document.getElementById('nsa-registration-form');
        if (form) {
            form.reset();
        }
        
        // Reset the current step and form data
        currentStep = 1;
        formData = {};
        
        return true; // Successfully submitted
    } catch (error) {
        console.error('Error submitting registration:', error);
        alert('There was a problem submitting your registration. Please try again.');
        return false; // Submission failed
    }
}


// ===================== Load Saved Form Data =====================
// Loads previously saved form data from sessionStorage into the form
function loadSavedFormData() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        const fieldName = input.name;
        if (!fieldName) return; // Skip inputs without name attribute
        
        const savedValue = sessionStorage.getItem(`nsa_form_${fieldName}`);
        
        if (savedValue) {
            if (input.type === 'radio' || input.type === 'checkbox') {
                // For radio/checkbox, check if this option was selected
                if (input.type === 'checkbox' && savedValue.startsWith('[')) {
                    // Handle checkbox groups (stored as JSON array)
                    try {
                        const valueArray = JSON.parse(savedValue);
                        if (valueArray.includes(input.value)) {
                            input.checked = true;
                        }
                    } catch (e) {
                        console.error('Error parsing saved checkbox data', e);
                    }
                } else if (input.value === savedValue) {
                    input.checked = true;
                    
                    // For radio buttons that trigger other UI changes
                    if (fieldName === 'category' && currentStep === 1) {
                        // We'll need to handle category changes later
                        formData[fieldName] = savedValue;
                    } else if (fieldName === 'membershipType' && input.value === 'active') {
                        // Show payment section if active membership was selected
                        const paymentSection = document.getElementById('payment-section');
                        if (paymentSection) {
                            paymentSection.classList.remove('hidden');
                            const paymentProof = document.getElementById('payment-proof');
                            if (paymentProof) {
                                paymentProof.setAttribute('required', 'required');
                            }
                        }
                    }
                }
            } else if (input.type !== 'file') { // Can't restore file inputs
                input.value = savedValue;
                
                // Add to formData for any dynamic UI that depends on this
                formData[fieldName] = savedValue;
            }
        }
    });
}

// ===================== Clear Form Data =====================
// Clears all saved form data from sessionStorage
function clearSavedFormData() {
    // Get all keys that start with nsa_form_
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('nsa_form_')) {
            keysToRemove.push(key);
        }
    }
    
    // Remove each key
    keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
    });
}
// ===================== END OF SCRIPT =====================

