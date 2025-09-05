// Multi-step registration form controller
let currentStep = 1;
let formData = {};
let verificationCode = null;

document.addEventListener('DOMContentLoaded', function() {
    loadFormData();
    initializeEventListeners();
    updateStepIndicator();
    updateProgress();
});

function initializeEventListeners() {
    // Category selection listeners
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', handleCategoryChange);
    });
    
    // Email type listeners (for alumni)
    document.querySelectorAll('input[name="emailType"]').forEach(radio => {
        radio.addEventListener('change', handleEmailTypeChange);
    });
    
    // MSU role listeners
    document.querySelectorAll('input[name="msuRole"]').forEach(radio => {
        radio.addEventListener('change', handleMSURoleChange);
    });
    
    // Membership type listeners
    document.querySelectorAll('input[name="membershipType"]').forEach(radio => {
        radio.addEventListener('change', handleMembershipTypeChange);
    });
    
    // Email validation
    document.getElementById('email').addEventListener('blur', validateEmail);
    
    // File upload validation
    document.getElementById('paymentProof').addEventListener('change', validateFileUpload);
    
    // Form submission
    document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);
}

function nextStep(step) {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        currentStep = step;
        showStep(currentStep);
        updateStepIndicator();
        updateProgress();
        updateConditionalFields();
    }
}

function previousStep(step) {
    // Save current step data before navigating back so we don't lose inputs
    saveCurrentStepData();

    currentStep = step;
    showStep(currentStep);
    updateStepIndicator();
    updateProgress();

    // Ensure conditional fields (and summary) are updated when navigating
    // back — this forces steps that depend on other inputs to re-render
    updateConditionalFields();
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(formStep => {
        formStep.classList.remove('active');
    });
    
    // Show current step
    const stepEl = document.getElementById(`formStep${step}`);
    if (stepEl) {
        stepEl.classList.add('active');
    } else {
        console.warn('showStep: step element not found for', step);
    }
}

function updateStepIndicator() {
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

function updateProgress() {
    const progressPercentage = (currentStep / 6) * 100;
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
}

function validateCurrentStep() {
    clearErrors();
    let isValid = true;
    
    switch(currentStep) {
        case 1:
            isValid = validateStep1();
            break;
        case 2:
            isValid = validateStep2();
            break;
        case 3:
            isValid = validateStep3();
            break;
        case 4:
            isValid = validateStep4();
            break;
        case 5:
            isValid = validateStep5();
            break;
        case 6:
            isValid = validateStep6();
            break;
    }
    
    return isValid;
}

function validateStep1() {
    const fullName = document.getElementById('fullName').value.trim();
    if (!fullName) {
        showError('fullName', 'Full name is required');
        return false;
    }
    if (fullName.length < 2) {
        showError('fullName', 'Please enter your full legal name');
        return false;
    }
    return true;
}

function validateStep2() {
    const category = document.querySelector('input[name="category"]:checked');
    if (!category) {
        showError('category', 'Please select a category');
        return false;
    }
    return true;
}

function validateStep3() {
    const email = document.getElementById('email').value.trim();
    const category = document.querySelector('input[name="category"]:checked')?.value;
    
    if (!email) {
        showError('email', 'Email is required');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        return false;
    }
    
    // Category-specific email validation
    if (category === 'current-msu' && !email.endsWith('@msstate.edu')) {
        showError('email', 'Current MSU members must use @msstate.edu email');
        return false;
    }
    
    if (category === 'alumni') {
        const emailType = document.querySelector('input[name="emailType"]:checked')?.value;
        if (!emailType) {
            showError('email', 'Please select email type');
            return false;
        }
        if (emailType === 'msu' && !email.endsWith('@msstate.edu')) {
            showError('email', 'MSU email must end with @msstate.edu');
            return false;
        }
    }
    
    // Check verification code if required
    const verificationGroup = document.getElementById('verificationGroup');
    if (verificationGroup.style.display !== 'none') {
        const code = document.getElementById('verificationCode').value.trim();
        if (!code) {
            showError('verification', 'Verification code is required');
            return false;
        }
    }
    
    return true;
}

function validateStep4() {
    const category = document.querySelector('input[name="category"]:checked')?.value;
    
    if (category === 'current-msu') {
        return validateCurrentMSUFields();
    } else if (category === 'alumni') {
        return validateAlumniFields();
    } else if (category === 'others') {
        return validateOthersFields();
    }
    
    return true;
}

function validateCurrentMSUFields() {
    const role = document.querySelector('input[name="msuRole"]:checked');
    if (!role) {
        showError('msuRole', 'Please select your role');
        return false;
    }
    
    const roleValue = role.value;
    
    if (roleValue === 'student') {
        const level = document.getElementById('studentLevel').value;
        const major = document.getElementById('major').value.trim();
        const graduation = document.getElementById('expectedGraduation').value;
        
        if (!level) {
            showError('studentLevel', 'Please select your level');
            return false;
        }
        if (!major) {
            showError('major', 'Please enter your major/department');
            return false;
        }
        if (!graduation) {
            showError('expectedGraduation', 'Please select expected graduation');
            return false;
        }
    } else if (roleValue === 'faculty') {
        const department = document.getElementById('facultyDepartment').value.trim();
        const position = document.getElementById('facultyPosition').value.trim();
        const years = document.getElementById('facultyYears').value;
        
        if (!department) {
            showError('facultyDepartment', 'Please enter your department');
            return false;
        }
        if (!position) {
            showError('facultyPosition', 'Please enter your position/title');
            return false;
        }
        if (!years || years < 0) {
            showError('facultyYears', 'Please enter years at MSU');
            return false;
        }
    } else if (roleValue === 'staff') {
        const office = document.getElementById('staffOffice').value.trim();
        const role = document.getElementById('staffRole').value.trim();
        const years = document.getElementById('staffYears').value;
        
        if (!office) {
            showError('staffOffice', 'Please enter your office/department');
            return false;
        }
        if (!role) {
            showError('staffRole', 'Please enter your role/position');
            return false;
        }
        if (!years || years < 0) {
            showError('staffYears', 'Please enter years at MSU');
            return false;
        }
    }
    
    return true;
}

function validateAlumniFields() {
    const year = document.getElementById('graduationYear').value;
    const degree = document.getElementById('degreeEarned').value.trim();
    const department = document.getElementById('alumniDepartment').value.trim();
    const country = document.getElementById('currentCountry').value;
    const state = document.getElementById('currentState').value.trim();
    const profession = document.getElementById('currentProfession').value.trim();
    
    if (!year || year < 1950 || year > 2025) {
        showError('graduationYear', 'Please enter a valid graduation year');
        return false;
    }
    if (!degree) {
        showError('degreeEarned', 'Please enter your degree');
        return false;
    }
    if (!department) {
        showError('alumniDepartment', 'Please enter your department/major');
        return false;
    }
    if (!country) {
        showError('currentCountry', 'Please select your current country');
        return false;
    }
    if (!state) {
        showError('currentState', 'Please enter your current state');
        return false;
    }
    if (!profession) {
        showError('currentProfession', 'Please enter your current profession');
        return false;
    }
    
    return true;
}

function validateOthersFields() {
    const country = document.getElementById('othersCountry').value;
    const city = document.getElementById('othersCity').value.trim();
    const relationship = document.getElementById('relationshipNSA').value;
    const involvement = document.querySelectorAll('input[name="involvement"]:checked');
    
    if (!country) {
        showError('othersCountry', 'Please select your country');
        return false;
    }
    if (!city) {
        showError('othersCity', 'Please enter your city');
        return false;
    }
    if (!relationship) {
        showError('relationshipNSA', 'Please select your relationship with NSA');
        return false;
    }
    if (involvement.length === 0) {
        showError('involvement', 'Please select at least one area of interest');
        return false;
    }
    
    return true;
}

function validateStep5() {
    const membershipType = document.querySelector('input[name="membershipType"]:checked');
    if (!membershipType) {
        showError('membership', 'Please select a membership type');
        return false;
    }
    
    if (membershipType.value === 'active') {
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            showError('payment', 'Please upload proof of payment');
            return false;
        }
    }
    
    return true;
}

function validateStep6() {
    const agreeMSU = document.getElementById('agreeMSU').checked;
    const agreeNSA = document.getElementById('agreeNSA').checked;
    
    if (!agreeMSU || !agreeNSA) {
        showError('agreement', 'Please agree to all terms and conditions');
        return false;
    }
    
    return true;
}

function handleCategoryChange() {
    const category = document.querySelector('input[name="category"]:checked')?.value;
    updateEmailInstructions(category);
    updateMembershipOptions(category);
}

function handleEmailTypeChange() {
    const emailType = document.querySelector('input[name="emailType"]:checked')?.value;
    const emailInput = document.getElementById('email');
    
    if (emailType === 'msu') {
        emailInput.placeholder = 'your.name@msstate.edu';
    } else {
        emailInput.placeholder = 'your.email@example.com';
    }
}

function handleMSURoleChange() {
    const role = document.querySelector('input[name="msuRole"]:checked')?.value;
    
    // Hide all role-specific fields
    document.getElementById('studentFields').style.display = 'none';
    document.getElementById('facultyFields').style.display = 'none';
    document.getElementById('staffFields').style.display = 'none';
    
    // Show relevant fields
    if (role) {
        document.getElementById(`${role}Fields`).style.display = 'block';
    }
}

function handleMembershipTypeChange() {
    const membershipType = document.querySelector('input[name="membershipType"]:checked')?.value;
    const paymentSection = document.getElementById('paymentSection');
    
    if (membershipType === 'active') {
        paymentSection.style.display = 'block';
        updatePaymentInfo();
    } else {
        paymentSection.style.display = 'none';
    }
}

function updateEmailInstructions(category) {
    const instructions = document.getElementById('emailInstructions');
    const emailTypeGroup = document.getElementById('emailTypeGroup');
    
    switch(category) {
        case 'current-msu':
            instructions.textContent = 'Enter your MSU email address (@msstate.edu)';
            emailTypeGroup.style.display = 'none';
            break;
        case 'alumni':
            instructions.textContent = 'Choose your email type and enter your email address';
            emailTypeGroup.style.display = 'block';
            break;
        case 'others':
            instructions.textContent = 'Enter your email address';
            emailTypeGroup.style.display = 'none';
            break;
    }
}

function updateMembershipOptions(category) {
    const passiveMemberOption = document.getElementById('passiveMemberOption');
    const membershipNote = document.getElementById('membershipNote');
    
    if (category === 'current-msu') {
        // Check if it's a student
        const role = document.querySelector('input[name="msuRole"]:checked')?.value;
        if (role === 'student') {
            passiveMemberOption.style.display = 'none';
            membershipNote.textContent = 'Active membership is compulsory for students';
            // Auto-select active membership
            document.getElementById('activeMember').checked = true;
            handleMembershipTypeChange();
        } else {
            passiveMemberOption.style.display = 'block';
            membershipNote.textContent = '';
        }
    } else {
        passiveMemberOption.style.display = 'block';
        membershipNote.textContent = '';
    }
}

function updateConditionalFields() {
    if (currentStep === 4) {
        const category = document.querySelector('input[name="category"]:checked')?.value;
        
        // Hide all category fields
        document.getElementById('currentMSUFields').style.display = 'none';
        document.getElementById('alumniFields').style.display = 'none';
        document.getElementById('othersFields').style.display = 'none';
        
        // Show relevant fields
        if (category === 'current-msu') {
            document.getElementById('currentMSUFields').style.display = 'block';
            document.getElementById('step4Instructions').textContent = 'Please provide your MSU details';
        } else if (category === 'alumni') {
            document.getElementById('alumniFields').style.display = 'block';
            document.getElementById('step4Instructions').textContent = 'Please provide your alumni information';
        } else if (category === 'others') {
            document.getElementById('othersFields').style.display = 'block';
            document.getElementById('step4Instructions').textContent = 'Please provide additional information';
        }
    }
    
    if (currentStep === 6) {
        updateSummary();
    }
}

function updatePaymentInfo() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 0-indexed
    const currentYear = today.getFullYear();
    
    let validUntil;
    if (currentMonth >= 8) { // August onwards - Fall enrollment
        validUntil = `July 31, ${currentYear + 1}`;
    } else { // January to July - Spring enrollment
        validUntil = `July 31, ${currentYear}`;
    }
    
    document.getElementById('paymentAmount').textContent = '$20';
    document.getElementById('validUntil').textContent = validUntil;
}

function sendVerificationCode() {
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showError('email', 'Please enter an email address first');
        return;
    }
    
    // Generate a random 6-digit code
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simulate sending email (in real app, this would be an API call)
    alert(`Verification code sent to ${email}: ${verificationCode}`);
    
    // Show verification group
    document.getElementById('verificationGroup').style.display = 'block';
}

function validateEmail() {
    const email = document.getElementById('email').value.trim();
    const category = document.querySelector('input[name="category"]:checked')?.value;
    
    clearError('email');
    
    if (email && !isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        return false;
    }
    
    if (category === 'current-msu' && email && !email.endsWith('@msstate.edu')) {
        showError('email', 'Current MSU members must use @msstate.edu email');
        return false;
    }
    
    return true;
}

function validateFileUpload() {
    const file = document.getElementById('paymentProof').files[0];
    clearError('payment');
    
    if (file) {
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        
        if (file.size > maxSize) {
            showError('payment', 'File size must be less than 2MB');
            document.getElementById('paymentProof').value = '';
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showError('payment', 'Only JPG, PNG, and PDF files are allowed');
            document.getElementById('paymentProof').value = '';
            return false;
        }
    }
    
    return true;
}

function updateSummary() {
    const summaryContent = document.getElementById('summaryContent');
    let summaryHTML = '';
    
    // Collect all form data and ensure we have the latest data
    saveCurrentStepData();
    const data = gatherFormData();
    
    // Fallback to formData if gatherFormData doesn't have all the data
    const completeData = { ...formData, ...data };
    
    // Basic Information
    summaryHTML += `
        <div class="summary-section">
            <h4>Basic Information</h4>
            <div class="summary-item">
                <div class="summary-label">Full Name:</div>
                <div class="summary-value">${completeData.fullName || 'Not provided'}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Category:</div>
                <div class="summary-value">${getCategoryDisplayName(completeData.category)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Email:</div>
                <div class="summary-value">${completeData.email || 'Not provided'}</div>
            </div>
        </div>
    `;
    
    // Category-specific information
    if (completeData.category === 'current-msu') {
        summaryHTML += buildCurrentMSUSummary(completeData);
    } else if (completeData.category === 'alumni') {
        summaryHTML += buildAlumniSummary(completeData);
    } else if (completeData.category === 'others') {
        summaryHTML += buildOthersSummary(completeData);
    }
    
    // Membership information
    summaryHTML += buildMembershipSummary(completeData);
    
    summaryContent.innerHTML = summaryHTML;
}

function buildCurrentMSUSummary(data) {
    let html = `
        <div class="summary-section">
            <h4>MSU Information</h4>
            <div class="summary-item">
                <div class="summary-label">Role:</div>
                <div class="summary-value">${data.msuRole?.charAt(0).toUpperCase() + data.msuRole?.slice(1)}</div>
            </div>
    `;
    
    if (data.msuRole === 'student') {
        html += `
            <div class="summary-item">
                <div class="summary-label">Level:</div>
                <div class="summary-value">${data.studentLevel?.charAt(0).toUpperCase() + data.studentLevel?.slice(1)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Major/Department:</div>
                <div class="summary-value">${data.major}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Expected Graduation:</div>
                <div class="summary-value">${data.expectedGraduation}</div>
            </div>
        `;
    } else if (data.msuRole === 'faculty') {
        html += `
            <div class="summary-item">
                <div class="summary-label">Department:</div>
                <div class="summary-value">${data.facultyDepartment}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Position:</div>
                <div class="summary-value">${data.facultyPosition}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Years at MSU:</div>
                <div class="summary-value">${data.facultyYears}</div>
            </div>
        `;
    } else if (data.msuRole === 'staff') {
        html += `
            <div class="summary-item">
                <div class="summary-label">Office/Department:</div>
                <div class="summary-value">${data.staffOffice}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Role:</div>
                <div class="summary-value">${data.staffRole}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Years at MSU:</div>
                <div class="summary-value">${data.staffYears}</div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

function buildAlumniSummary(data) {
    return `
        <div class="summary-section">
            <h4>Alumni Information</h4>
            <div class="summary-item">
                <div class="summary-label">Graduation Year:</div>
                <div class="summary-value">${data.graduationYear}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Degree Earned:</div>
                <div class="summary-value">${data.degreeEarned}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Department/Major:</div>
                <div class="summary-value">${data.alumniDepartment}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Current Location:</div>
                <div class="summary-value">${data.currentState}, ${getCountryName(data.currentCountry)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Current Profession:</div>
                <div class="summary-value">${data.currentProfession}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Support NSA:</div>
                <div class="summary-value">${data.supportNSA ? 'Yes' : 'No'}</div>
            </div>
        </div>
    `;
}

function buildOthersSummary(data) {
    // Handle involvement array or fallback to current checkbox values
    let involvements = '';
    if (data.involvement && Array.isArray(data.involvement)) {
        involvements = data.involvement.join(', ');
    } else {
        involvements = Array.from(document.querySelectorAll('input[name="involvement"]:checked'))
            .map(cb => cb.value)
            .join(', ');
    }
        
    return `
        <div class="summary-section">
            <h4>Additional Information</h4>
            <div class="summary-item">
                <div class="summary-label">Location:</div>
                <div class="summary-value">${data.othersCity}, ${getCountryName(data.othersCountry)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Relationship with NSA:</div>
                <div class="summary-value">${getRelationshipDisplayName(data.relationshipNSA)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Areas of Interest:</div>
                <div class="summary-value">${involvements || 'None selected'}</div>
            </div>
        </div>
    `;
}

function buildMembershipSummary(data) {
    return `
        <div class="summary-section">
            <h4>Membership Information</h4>
            <div class="summary-item">
                <div class="summary-label">Membership Type:</div>
                <div class="summary-value">${data.membershipType === 'active' ? 'Active Member (Paid)' : 'Passive Member (Free)'}</div>
            </div>
            ${data.membershipType === 'active' ? `
                <div class="summary-item">
                    <div class="summary-label">Payment Amount:</div>
                    <div class="summary-value">$20</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Payment Proof:</div>
                    <div class="summary-value">Uploaded</div>
                </div>
            ` : ''}
        </div>
    `;
}

function gatherFormData() {
    const data = {};
    
    // Gather all form fields
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        if (element.type === 'radio') {
            if (element.checked) {
                data[element.name] = element.value;
            }
        } else if (element.type === 'checkbox') {
            if (element.checked) {
                // Handle multiple checkboxes with same name
                if (element.name === 'involvement') {
                    if (!data[element.name]) {
                        data[element.name] = [];
                    }
                    data[element.name].push(element.value);
                } else {
                    data[element.name] = element.value;
                }
            }
        } else if (element.type === 'file') {
            // Handle file inputs
            if (element.files && element.files.length > 0) {
                data[element.name] = element.files[0].name;
            }
        } else if (element.value && element.value.trim() !== '') {
            data[element.name] = element.value.trim();
        }
    });
    
    // Also merge with existing formData to ensure we don't lose data from previous steps
    return { ...formData, ...data };
}

function getCategoryDisplayName(category) {
    const names = {
        'current-msu': 'Current MSU Student/Staff/Faculty',
        'alumni': 'MSU Alumni',
        'others': 'Others'
    };
    return names[category] || category;
}

function getCountryName(countryCode) {
    const countries = {
        'us': 'United States',
        'uk': 'United Kingdom',
        'ca': 'Canada',
        'au': 'Australia',
        'in': 'India',
        'other': 'Other'
    };
    return countries[countryCode] || countryCode;
}

function getRelationshipDisplayName(relationship) {
    const relationships = {
        'friend': 'Friend of member',
        'colleague': 'Professional colleague',
        'interested': 'Interested in activities',
        'supporter': 'Community supporter',
        'other': 'Other'
    };
    return relationships[relationship] || relationship;
}

function saveCurrentStepData() {
    formData = { ...formData, ...gatherFormData() };
    localStorage.setItem('registrationData', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('registrationData');
    if (savedData) {
        formData = JSON.parse(savedData);
        
        // Populate form fields
        Object.keys(formData).forEach(key => {
            // Skip file inputs - cannot be programmatically set for security reasons
            if (key === 'paymentProof') {
                return;
            }
            
            // Handle involvement checkboxes array
            if (key === 'involvement' && Array.isArray(formData[key])) {
                formData[key].forEach(value => {
                    const checkbox = document.querySelector(`input[name="involvement"][value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                return;
            }
            
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const specificElement = document.querySelector(`[name="${key}"][value="${formData[key]}"]`);
                    if (specificElement) {
                        specificElement.checked = true;
                    }
                } else if (element.type === 'checkbox') {
                    const specificElement = document.querySelector(`[name="${key}"][value="${formData[key]}"]`);
                    if (specificElement) {
                        specificElement.checked = true;
                    }
                } else if (element.type !== 'file') {
                    element.value = formData[key];
                }
            }
        });
        
        // Trigger change events to show/hide conditional fields
        const categoryElement = document.querySelector('input[name="category"]:checked');
        if (categoryElement) {
            handleCategoryChange();
        }
        
        const msuRoleElement = document.querySelector('input[name="msuRole"]:checked');
        if (msuRoleElement) {
            handleMSURoleChange();
        }
        
        const membershipElement = document.querySelector('input[name="membershipType"]:checked');
        if (membershipElement) {
            handleMembershipTypeChange();
        }
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    saveCurrentStepData();

    // Add submission metadata
    formData.submitted = true;
    formData.submissionDate = new Date().toISOString();
    localStorage.setItem('registrationData', JSON.stringify(formData));

    // POST to server so req.body is populated server-side and logged
    try {
        const resp = await fetch('/registration-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ message: resp.statusText }));
            console.error('Server responded with error:', err);
            alert('Submission failed: ' + (err.message || resp.statusText));
            return;
        }
    } catch (err) {
        console.error('Failed to submit form:', err);
        alert('Submission failed; please try again.');
        return;
    }

    // Redirect to summary page on success
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';

    setTimeout(() => {
        window.location.href = 'summary';
    }, 500);
}

function showError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.add('error');
    }
}

function clearError(fieldName) {
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.remove('error');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(element => {
        element.textContent = '';
    });
    document.querySelectorAll('.error').forEach(element => {
        element.classList.remove('error');
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function goBack() {
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'index';
    }, 500);
}
