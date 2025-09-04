// animations logic
if (performance.getEntriesByType("navigation")[0].type === "navigate")
{
document.addEventListener("DOMContentLoaded", () => {
  const animation = document.querySelector(".nsa-animation");
  const formContainer = document.querySelector(".form-container");  // default hidden

  setTimeout(() => {
    animation.classList.add("hide");
    setTimeout(() => {
      animation.style.display = "none";
      formContainer.classList.remove("hidden");
    }, 500);
  }, 2500);
});
}
else 
{
    const animation = document.querySelector(".nsa-animation");
    const formContainer = document.querySelector(".form-container");  // default hidden

    animation.classList.add("hidden");
    formContainer.classList.remove("hidden");
    formContainer.classList.add("show");
}

// Removed server-only modules (body-parser, nodemailer) - not needed on client
let fees = 0;  // used later for calculating fees
let formData = {};
const pages = document.querySelectorAll(".form-page");   // current page being displayed, array
let currentPage = 0;

// custom alert functions 
function showCustomAlert(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('customAlert').style.display = 'flex';
  }

function closeCustomAlert() {
    document.getElementById('customAlert').style.display = 'none';
  }


// next buttons
const next1 = document.getElementById("next1");
const next2 = document.getElementById("next2");
const next3 = document.getElementById("next3");

// back buttons
const back1 = document.getElementById("back1");
const back2 = document.getElementById("back2");
const back3 = document.getElementById("back3");

// additional buttons
const toHomeBtn = document.getElementById("toHomeBtn");
const emailInput = document.getElementById("email");             // email input
const personalEmailInput = document.getElementById("personalEmail"); // personal email input
const personalEmailSection = document.getElementById("personalEmailSection"); // personal email section
// Verification UI removed: references cleaned up
const memberTypeSelect = document.getElementById("memberType");   // active / paid
const paymentUploadSection = document.getElementById("paymentUploadSection");
const summaryBox = document.getElementById("summaryBox");
const form = document.getElementById("registrationForm");
const categorySelect = document.getElementById("category");
form.reset();
// Restore any saved values for page 0 on load
document.addEventListener('DOMContentLoaded', () => {
  pages[0].querySelectorAll('input,select,textarea').forEach(restoreValueTo);
});

// Set today's date as default for enrollment date
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split('T')[0];
  const enrolledDateField = document.getElementById("enrolled-date");
  if (enrolledDateField) {
    enrolledDateField.value = today;
  }
});

// Show/hide personal email section and prepare membership type based on category selection
categorySelect.addEventListener("change", () => {
  const category = categorySelect.value;
  
  if (category === "current") {
    personalEmailSection.classList.remove("hidden");
    // For current MSU students/faculty, prepare Active membership (will be set when reaching page 3)
    prepareMembershipType("active");
  } else if (category === "alumni" || category === "others") {
    personalEmailSection.classList.add("hidden");
    personalEmailInput.value = ""; // Clear personal email when hidden
    // For others, prepare Passive membership (will be set when reaching page 3)
    prepareMembershipType("passive");
  } else {
    // If no category selected, reset membership preparation
    prepareMembershipType(null);
  }
  
  // Recalculate membership cycle if date is already selected
  const enrolledDateField = document.getElementById("enrolled-date");
  if (enrolledDateField && enrolledDateField.value) {
    enrolledDateField.dispatchEvent(new Event('change'));
  }
});

// Helper to check element visibility
function isVisible(el) {
  if (!el) return false;
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// Generic page validator: ensures all required, visible controls in the given page index are filled
function validatePage(index) {
  const page = pages[index];
  if (!page) return true; // nothing to validate

  const controls = page.querySelectorAll('input, select, textarea');
  for (const el of controls) {
    if (!el.required) continue; // only validate required fields
    if (!isVisible(el)) continue; // skip hidden controls

    const tag = el.tagName.toLowerCase();
    const type = (el.type || '').toLowerCase();

    if (type === 'radio') {
      // ensure at least one radio in the group is checked
      const group = page.querySelectorAll(`input[type="radio"][name="${el.name}"]`);
      if (group.length > 0) {
        const anyChecked = Array.from(group).some(r => r.checked);
        if (!anyChecked) return false;
      }
      continue;
    }

    if (type === 'checkbox') {
      if (!el.checked) return false;
      continue;
    }

    if (type === 'file') {
      if (!el.files || el.files.length === 0) return false;
      continue;
    }

    if (tag === 'select') {
      if (!el.value || el.value === '') return false;
      continue;
    }

    // text, email, number, date, etc.
    if (!el.value || (typeof el.value === 'string' && el.value.trim() === '')) return false;
  }

  return true;
}

// Capture values from visible controls on a page into formData
function capturePageValues(index) {
  const page = pages[index];
  if (!page) return;
  const controls = page.querySelectorAll('input, select, textarea');
  for (const el of controls) {
    if (!isVisible(el)) continue;
    const key = el.id || el.name;
    if (!key) continue;

    const type = (el.type || '').toLowerCase();
    if (type === 'file') {
      // can't persist file content; store filename if available
      formData[key] = el.files && el.files.length > 0 ? el.files[0].name : '';
      continue;
    }
    if (type === 'checkbox') {
      formData[key] = el.checked;
      continue;
    }
    if (type === 'radio') {
      const group = page.querySelectorAll(`input[type="radio"][name="${el.name}"]`);
      if (group.length > 0) {
        const checked = Array.from(group).find(r => r.checked);
        formData[el.name] = checked ? checked.value : '';
      }
      continue;
    }
    formData[key] = el.value;
  }
}

// Restore a value to an element if present in formData
function restoreValueTo(el) {
  if (!el) return;
  const key = el.id || el.name;
  if (!key) return;
  const val = formData[key];
  if (val === undefined) return;

  const type = (el.type || '').toLowerCase();
  if (type === 'checkbox') {
    el.checked = !!val;
    return;
  }
  if (type === 'radio') {
    if (el.value === val) el.checked = true;
    return;
  }
  if (type === 'file') {
    // cannot programmatically restore file inputs due to browser security
    return;
  }
  el.value = val;
}

// Variable to store the prepared membership type
let preparedMembershipType = null;

// Function to prepare membership type based on category (doesn't show UI changes yet)
function prepareMembershipType(type) {
  preparedMembershipType = type;
  
  // Also prepare the enrolled-date field requirements
  const enrolledDateField = document.getElementById("enrolled-date");
  const enrolledDateLabel = document.querySelector('label[for="enrolled-date"]');
  
  if (type === "active") {
    // For active members (current MSU), enrolled-date is required
    enrolledDateField.required = true;
  } else if (type === "passive") {
    // For passive members (alumni/others), enrolled-date is still shown but not required for fee calculation
    enrolledDateField.required = false;
  }
}

// Function to actually set membership type when on page 3
function setMembershipType(type) {
  const memberTypeSelect = document.getElementById("memberType");
  const enrolledDateField = document.getElementById("enrolled-date");
  const enrolledDateLabel = document.querySelector('label[for="enrolled-date"]');
  
  if (type === "active") {
    // Set Active Member for current MSU students/faculty
    memberTypeSelect.innerHTML = `<option value="active" selected>Active Member (Fee Required)</option>`;
    memberTypeSelect.value = "active";
    // Add visual styling for auto-selected
    memberTypeSelect.classList.add("membership-auto-selected");
    // Show enrolled-date field and make it required
    enrolledDateLabel.style.display = "block";
    enrolledDateField.style.display = "block";
    enrolledDateField.required = true;
    // Trigger the change event to show payment upload section
    memberTypeSelect.dispatchEvent(new Event('change'));
  // restore any cached values for membership fields
  document.querySelectorAll('#page3 input, #page3 select, #page3 textarea').forEach(restoreValueTo);
  } else if (type === "passive") {
    // Set Passive Member for others
    memberTypeSelect.innerHTML = `<option value="passive" selected>Passive Member (Free)</option>`;
    memberTypeSelect.value = "passive";
    // Add visual styling for auto-selected
    memberTypeSelect.classList.add("membership-auto-selected");
    // Show enrolled-date field but make it not required for fee calculation
    enrolledDateLabel.style.display = "block";
    enrolledDateField.style.display = "block";
    enrolledDateField.required = false;
    // Trigger the change event to hide payment upload section
    memberTypeSelect.dispatchEvent(new Event('change'));
  // restore any cached values for membership fields
  document.querySelectorAll('#page3 input, #page3 select, #page3 textarea').forEach(restoreValueTo);
  } else {
    // Reset to normal dropdown
    memberTypeSelect.classList.remove("membership-auto-selected");
    memberTypeSelect.innerHTML = `
      <option value="">-- Select Type --</option>
      <option value="active">Active Member (Fee Paid)</option>
      <option value="passive">Passive Member (Free)</option>
    `;
    memberTypeSelect.value = "";
    // Show enrolled-date field but make it conditionally required
    enrolledDateLabel.style.display = "block";
    enrolledDateField.style.display = "block";
    enrolledDateField.required = false;
  document.querySelectorAll('#page3 input, #page3 select, #page3 textarea').forEach(restoreValueTo);
  }
}


// Default landing behavior: hide optional verification UI if present and hide next button
function defaultLanding() {
  const verifyGroupEl = document.getElementById('verifyGroup');
  if (verifyGroupEl) verifyGroupEl.classList.add('hidden');
  // leave next1 visible by default (verification removed)
}

  // 🟢 Member type triggers payment upload (only for current MSU students/faculty)
  memberTypeSelect.addEventListener("change", () => {
    const category = document.getElementById("category").value;
    const memberType = memberTypeSelect.value;
    
    // Show payment upload only for current MSU students/faculty selecting Active membership
    if (category === "current" && memberType === "active") {
      paymentUploadSection.classList.remove("hidden");
    } else {
      paymentUploadSection.classList.add("hidden");
    }
  });

  // 🟢 Navigation
  function showPage(index) {
    pages.forEach((page, i) => {
      page.classList.toggle("active", i === index);
    });
    currentPage = index;
  }

  next1.addEventListener("click", () => {
    // Validate current page before moving forward
    if (!validatePage(0)) {
      showCustomAlert('Please fill all required fields on this page before continuing.');
      return;
    }
    // capture values from page 0
    capturePageValues(0);
    // Store the selected category and load conditional fields for page 2
    formData["category"] = document.getElementById("category").value;
    showPage(1);
    loadConditionalFields(formData["category"]);
  });
  next2.addEventListener("click", () => {
    if (!validatePage(1)) {
      showCustomAlert('Please fill all required fields on this page before continuing.');
      return;
    }
  // When moving to page 3 (membership page), set the prepared membership type
    if (preparedMembershipType) {
      setMembershipType(preparedMembershipType);
    }
    showPage(2);
  });
  next3.addEventListener("click", () => {
    if (!validatePage(2)) {
      showCustomAlert('Please fill all required fields on this page before continuing.');
      return;
    }
    generateSummary();
    showPage(3);
  });

  back1.addEventListener("click", () => {
    showPage(0);
  });
  back2.addEventListener("click", () => {
    capturePageValues(2);
    showPage(1);
  });
  back3.addEventListener("click", () => {
    // When returning to page 3 (membership page), re-set the prepared membership type
    if (preparedMembershipType) {
      setMembershipType(preparedMembershipType);
    }
    capturePageValues(3);
    showPage(2);
  });

  // 🟢 Go back to home page
  toHomeBtn.addEventListener("click", () => {
  window.location.href = "/index.html";
  });

  // 🟢 Final summary generator
  function generateSummary() {
    const fullName = document.getElementById("fullName").value;
    const email = emailInput.value;
    const personalEmail = personalEmailInput.value;
    const category = document.getElementById("category").value;
    const memberType = memberTypeSelect.value;
    const enrolledDateValue = document.getElementById("enrolled-date").value;

    let text = `Name: ${fullName}\n`;
    text += `MSU Email: ${email}\n`;
    
    // Add personal email to summary if provided
    if (personalEmail && personalEmail.trim() !== "") {
      text += `Personal Email: ${personalEmail}\n`;
    }
    
    text += `Category: ${getCategoryDisplayName(category)}\n`;
    text += `Membership: ${getMembershipDisplayName(memberType, category)}\n`;
    
    if (enrolledDateValue) {
      // Calculate and show cycle information
      const enrolledDate = new Date(enrolledDateValue);
      if (!isNaN(enrolledDate)) {
        const cycleInfo = calculateMembershipCycle(enrolledDate, category);
        text += `Enrollment Date: ${enrolledDateValue}\n`;
        text += `Membership Cycle: ${cycleInfo.cycleType}\n`;
        text += `Expires: ${cycleInfo.expiryDate}\n`;
      }
    }
    
    if (category === "current" && memberType === "active" && fees > 0) {
      text += `Membership Fee: $${fees}\n`;
    }

    // More fields can be appended here from dynamic inputs
    summaryBox.textContent = text;
  }
  
  // Helper function to get display name for category
  function getCategoryDisplayName(category) {
    switch(category) {
      case "current": return "Current MSU Student/Faculty";
      case "alumni": return "MSU Alumni";
      case "others": return "Others";
      default: return category;
    }
  }
  
  // Helper function to get display name for membership
  function getMembershipDisplayName(memberType, category) {
    if (memberType === "active") {
      return fees > 0 ? `Active Member ($${fees})` : "Active Member";
    } else if (memberType === "passive") {
      return "Passive Member (Free)";
    }
    return memberType;
  }

  // Helper function to calculate membership cycle information
  function calculateMembershipCycle(enrolledDate, category) {
    const month = enrolledDate.getMonth() + 1;
    const day = enrolledDate.getDate();
    
    let cycleType = "";
    let expiryDate = "";
    
    if ((month === 8 && day >= 1) || (month >= 9 && month <= 12) || (month === 12 && day <= 31)) {
      cycleType = "Fall Cycle";
      expiryDate = "July 31st of next year";
    } else if ((month === 1 && day >= 1) || (month >= 2 && month <= 4) || (month === 4 && day <= 30)) {
      cycleType = "Spring Cycle";
      expiryDate = "December 31st of same year";
    } else {
      cycleType = "Summer Cycle";
      expiryDate = "December 31st of same year";
    }
    
    return { cycleType, expiryDate };
  }



  // default first page is handled by defaultLanding() above


  // 🟢 Final Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Collect form data
    const name = document.getElementById("fullName").value.trim();
    const email = emailInput.value.trim();
    const personalEmail = personalEmailInput.value.trim();
    const phone = document.getElementById("phone").value.trim();
    const category = document.getElementById("category").value;
    const memberType = memberTypeSelect.value;
    const enrolledDate = document.getElementById("enrolled-date").value.trim();
    
    // Validation for membership type selection
    if (!memberType) {
      showCustomAlert("Please select a membership type.");
      return;
    }
    
    // Validation for current MSU students/faculty (active members)
    if (category === "current" && memberType === "active") {
      if (!enrolledDate) {
        showCustomAlert("Please enter the enrolled date.");
        return;
      }
      
      // Check if payment proof is uploaded for active members
      const paymentProof = document.getElementById("paymentProof");
      if (!paymentProof.files || paymentProof.files.length === 0) {
        showCustomAlert("Please upload proof of payment for active membership.");
        return;
      }
    }
    
    // Validate dynamic fields based on current category
    if (!validateDynamicFields(category)) {
      return; // Stop submission if validation fails
    }
    
    // Prepare data object
    const submissionData = { 
      name, 
      email, 
      phone, 
      category, 
      memberType,
      membershipFee: fees || 0
    };
    
    // Add enrolled date only if it's provided (for active members)
    if (enrolledDate && enrolledDate !== "") {
      submissionData.enrolledDate = enrolledDate;
    }
    
    // Add personal email if provided
    if (personalEmail && personalEmail !== "") {
      submissionData.personalEmail = personalEmail;
    }

    // Handle file upload for active members
    const paymentProof = document.getElementById("paymentProof");
    if (category === "current" && memberType === "active" && paymentProof.files && paymentProof.files.length > 0) {
      const file = paymentProof.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        submissionData.paymentProof = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result // Base64 encoded file data
        };
        
        // Send data to backend after file is processed
        submitRegistration(submissionData);
      };
      
      reader.readAsDataURL(file);
    } else {
      // Send data to backend without file
      submitRegistration(submissionData);
    }
  });
  
  // Helper function to submit registration data
  function submitRegistration(submissionData) {
    // Fetch CSRF token then submit with the token in header
    fetch('/csrf-token', { method: 'GET', credentials: 'same-origin' })
      .then(r => r.json())
      .then(tokenResp => {
        const token = tokenResp && tokenResp.csrfToken;
        return fetch('/register', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': token || ''
          },
          body: JSON.stringify(submissionData)
        });
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.location.href = "/thank-you.html";
        } else {
          showCustomAlert("Submission failed: " + (data.error || "Unknown error"));
        }
      })
      .catch(err => {
        showCustomAlert("Error submitting form: " + err.message);
      });
  }



// membership fee and cycle calculation
const enrolledDateField = document.getElementById("enrolled-date");

enrolledDateField.addEventListener("change", () => {
  const enrolledDate = new Date(enrolledDateField.value);
  const category = document.getElementById("category").value;
  
  if (isNaN(enrolledDate)) {
    return;
  }
  
  const month = enrolledDate.getMonth() + 1; // JavaScript months are 0-indexed
  const day = enrolledDate.getDate();
  
  let cycleType = "";
  let expiryDate = "";
  let membershipFee = 0;
  
  // Determine membership cycle based on enrollment date
  if ((month === 8 && day >= 1) || (month >= 9 && month <= 12) || (month === 12 && day <= 31)) {
    // August 1 - December 31: Fall cycle
    cycleType = "Fall Cycle";
    expiryDate = "July 31st of next year";
    if (category === "current") {
      membershipFee = 20;
    }
  } else if ((month === 1 && day >= 1) || (month >= 2 && month <= 4) || (month === 4 && day <= 30)) {
    // January 1 - April 30: Spring cycle  
    cycleType = "Spring Cycle";
    expiryDate = "December 31st of same year";
    if (category === "current") {
      membershipFee = 20;
    }
  } else {
    // May 1 - July 31: Summer cycle (default)
    cycleType = "Summer Cycle";
    expiryDate = "December 31st of same year";
    if (category === "current") {
      membershipFee = 20;
    }
  }
  
  // Update global fees variable
  fees = membershipFee;
  
  // Update UI
  updateMembershipCycleInfo(cycleType, expiryDate, membershipFee, category);
  
  if (category === "current" && membershipFee > 0) {
    updateActiveMembershipText(membershipFee);
  }
  
  console.log("Enrollment Date:", enrolledDateField.value);
  console.log("Cycle Type:", cycleType);
  console.log("Expiry Date:", expiryDate);
  console.log("Membership Fee: $" + membershipFee);
});

// Function to update membership cycle information display
function updateMembershipCycleInfo(cycleType, expiryDate, fee, category) {
  const cycleInfo = document.getElementById("membershipCycleInfo");
  const cycleTypeSpan = document.getElementById("cycleType");
  const expiryDateSpan = document.getElementById("expiryDate");
  const membershipFeeSpan = document.getElementById("membershipFee");
  
  if (cycleInfo && cycleTypeSpan && expiryDateSpan && membershipFeeSpan) {
    cycleTypeSpan.textContent = cycleType;
    expiryDateSpan.textContent = expiryDate;
    
    if (category === "current") {
      membershipFeeSpan.textContent = `$${fee}`;
    } else {
      membershipFeeSpan.textContent = "Free (Passive Member)";
    }
    
    cycleInfo.classList.remove("hidden");
  }
}

// Function to update the Active Member option text with fee
function updateActiveMembershipText(fee) {
  const memberTypeSelect = document.getElementById("memberType");
  const activeOption = memberTypeSelect.querySelector('option[value="active"]');
  if (activeOption) {
    activeOption.text = `Active Member (Fee: $${fee})`;
  }
}






// section 2 logic

const conditionalFields = document.getElementById("conditionalFields");

// Clear all dynamic fields and their validation
function clearAllDynamicFields() {
  conditionalFields.innerHTML = "";
  // Remove any orphaned required fields that might cause validation issues
  const form = document.getElementById("registrationForm");
  const dynamicInputs = form.querySelectorAll('input[name="major"], input[name="degreeLevel"], input[name="startDate"], input[name="endDate"], input[name="department"], input[name="position"], input[name="years"], input[name="currentJob"], input[name="affiliation"], input[name="expectations"]');
  dynamicInputs.forEach(input => {
    if (input.parentNode && !conditionalFields.contains(input)) {
      input.remove();
    }
  });
}

function loadConditionalFields(category) {
  clearAllDynamicFields(); // Use the new clearing function

  if (category === "current") {
    const roleSelect = document.createElement("select");
    roleSelect.innerHTML = `
      <option value="">-- Are you a student or staff/faculty? --</option>
      <option value="student">Student</option>
      <option value="staff">Staff/Faculty</option>
    `;
    roleSelect.required = true;
    roleSelect.id = "currentRole";
    roleSelect.name = "currentRole";
    conditionalFields.appendChild(labelElement("Your Role"));
    conditionalFields.appendChild(roleSelect);

    roleSelect.addEventListener("change", () => {
      const role = roleSelect.value;
      addFieldsForCurrent(role);
    });

  } else if (category === "alumni") {
    addAlumniFields();

  } else if (category === "others") {
    addOthersFields();
  }
}

// functions to make elements instantly instead of doing them one by one.
function labelElement(text) {
  const label = document.createElement("label");
  label.textContent = text;
  return label;
}

function inputElement(type, id, placeholder, isRequired = true) {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  if (isRequired) {
    input.required = true;
  }
  return input;
}


// dynamic field additions for just student or child
function addFieldsForCurrent(role) {
  const extraFields = document.createElement("div");
  extraFields.id = "extraCurrentFields";
  const existing = document.getElementById("extraCurrentFields");
  if (existing) existing.remove();

  if (role === "student") {
    extraFields.appendChild(labelElement("Major"));
    extraFields.appendChild(inputElement("text", "major", "Enter your major", false));

    extraFields.appendChild(labelElement("Degree Level"));
    extraFields.appendChild(inputElement("text", "degreeLevel", "Bachelor's/Master's/PhD", false));

    extraFields.appendChild(labelElement("Start Date"));
    extraFields.appendChild(inputElement("date", "startDate", "Enter start date", false));

    extraFields.appendChild(labelElement("Expected Graduation Date"));
    extraFields.appendChild(inputElement("date", "endDate", "Enter expected end date", false));

  } else if (role === "staff") {
    extraFields.appendChild(labelElement("Office / Department"));
    extraFields.appendChild(inputElement("text", "department", "Enter office or department", false));

    extraFields.appendChild(labelElement("Position"));
    extraFields.appendChild(inputElement("text", "position", "Enter your job title", false));

    extraFields.appendChild(labelElement("Years at MSU"));
    extraFields.appendChild(inputElement("number", "years", "How many years at MSU?", false));
  }

  conditionalFields.appendChild(extraFields);
}

function addAlumniFields() {
  conditionalFields.appendChild(labelElement("Major"));
  conditionalFields.appendChild(inputElement("text", "major", "Enter your major", false));

  conditionalFields.appendChild(labelElement("Degree Level"));
  conditionalFields.appendChild(inputElement("text", "degreeLevel", "Bachelor's/Master's/PhD", false));

  conditionalFields.appendChild(labelElement("Start Date"));
  conditionalFields.appendChild(inputElement("date", "startDate", "Enter start date", false));

  conditionalFields.appendChild(labelElement("Graduation Date"));
  conditionalFields.appendChild(inputElement("date", "endDate", "Enter graduation date", false));

  conditionalFields.appendChild(labelElement("Current Job / Position"));
  conditionalFields.appendChild(inputElement("text", "currentJob", "Where are you working now?", false));
}

function addOthersFields() {
  conditionalFields.appendChild(labelElement("How are you affiliated with MSU?"));
  conditionalFields.appendChild(inputElement("text", "affiliation", "Enter your answer", false));

  conditionalFields.appendChild(labelElement("What do you hope to gain from NSA events?"));
  conditionalFields.appendChild(inputElement("text", "expectations", "Enter your response", false));
}

// Validate dynamic fields based on category
function validateDynamicFields(category) {
  if (category === "current") {
    const roleSelect = document.querySelector('select[name="currentRole"]');
    if (!roleSelect || !roleSelect.value) {
      showCustomAlert("Please select whether you are a student or staff/faculty.");
      return false;
    }
    
    const role = roleSelect.value;
    if (role === "student") {
      const major = document.getElementById("major");
      const degreeLevel = document.getElementById("degreeLevel");
      const startDate = document.getElementById("startDate");
      const endDate = document.getElementById("endDate");
      
      if (!major || !major.value.trim()) {
        showCustomAlert("Please enter your major.");
        return false;
      }
      if (!degreeLevel || !degreeLevel.value.trim()) {
        showCustomAlert("Please enter your degree level.");
        return false;
      }
      if (!startDate || !startDate.value) {
        showCustomAlert("Please enter your start date.");
        return false;
      }
      if (!endDate || !endDate.value) {
        showCustomAlert("Please enter your expected graduation date.");
        return false;
      }
    } else if (role === "staff") {
      const department = document.getElementById("department");
      const position = document.getElementById("position");
      const years = document.getElementById("years");
      
      if (!department || !department.value.trim()) {
        showCustomAlert("Please enter your office/department.");
        return false;
      }
      if (!position || !position.value.trim()) {
        showCustomAlert("Please enter your position.");
        return false;
      }
      if (!years || !years.value.trim()) {
        showCustomAlert("Please enter years at MSU.");
        return false;
      }
    }
  } else if (category === "alumni") {
    const major = document.getElementById("major");
    const degreeLevel = document.getElementById("degreeLevel");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const currentJob = document.getElementById("currentJob");
    
    if (!major || !major.value.trim()) {
      showCustomAlert("Please enter your major.");
      return false;
    }
    if (!degreeLevel || !degreeLevel.value.trim()) {
      showCustomAlert("Please enter your degree level.");
      return false;
    }
    if (!startDate || !startDate.value) {
      showCustomAlert("Please enter your start date.");
      return false;
    }
    if (!endDate || !endDate.value) {
      showCustomAlert("Please enter your graduation date.");
      return false;
    }
    if (!currentJob || !currentJob.value.trim()) {
      showCustomAlert("Please enter your current job/position.");
      return false;
    }
  } else if (category === "others") {
    const affiliation = document.getElementById("affiliation");
    const expectations = document.getElementById("expectations");
    
    if (!affiliation || !affiliation.value.trim()) {
      showCustomAlert("Please describe your affiliation with MSU.");
      return false;
    }
    if (!expectations || !expectations.value.trim()) {
      showCustomAlert("Please describe what you hope to gain from NSA events.");
      return false;
    }
  }
  
  return true;
}
