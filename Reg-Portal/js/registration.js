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
const sendCodeBtn = document.getElementById("sendCodeBtn");      // code send button 
const verifyGroup = document.getElementById("verifyGroup");      // contains code label, code input, and response message paragraph
const verifyCodeInput = document.getElementById("verifyCode");  // the input part
const verifiedMsg = document.getElementById("verifiedMsg");     // the result in p tag
const memberTypeSelect = document.getElementById("memberType");   // active / paid
const paymentUploadSection = document.getElementById("paymentUploadSection");
const summaryBox = document.getElementById("summaryBox");
const form = document.getElementById("registrationForm");
form.reset();


// First page verification and email sending logic
sendCodeBtn.addEventListener("click", () => {
  emailInput.removeAttribute("readonly");
  const email = emailInput.value.trim();
  let name = document.getElementById("fullName").value.trim();
  const category = document.getElementById("category").value;
  console.log(category);
  if (email === "") 
    {
      showCustomAlert("Please enter a valid email");
      // clicking ok button automatically closes the custom alert, coded in the 
      return NaN;
    }
    else if (email === "@msstate.edu" || email === "@gmail.com")
    {
        showCustomAlert("Enter a valid address, dude!");
        return NaN;
    }
  else if (name === "" || category === "") {
      showCustomAlert("Please enter all the details.")
      return NaN;
  }
  else if (category === "current" || category === "alumni")
  {
      if (email.endsWith("@msstate.edu"))
      {
        console.log("Valid Email for students/ alumni");
          verifyGroup.classList.remove("hidden");
          showCustomAlert(`Verification code sent to ${email}`);
      }
      else {
        showCustomAlert("The email must end with @msstate.edu for current students/staffs, and alumni.");
        return NaN;
      }
  }
  else if (category === "others")
  {
    if (email.endsWith("@gmail.com"))
    {
      console.log("Valid Email for others part");
        verifyGroup.classList.remove("hidden");
        showCustomAlert(`Verification code sent to ${email}`);
    }
    else 
    {
      showCustomAlert("Since you are trying to register from others category, you are encouraged to use your primary google mail (gmail).")
      return NaN;
    }
  }
  });

  // email verification code validation
  verifyCodeInput.addEventListener("input", () => {
    if (verifyCodeInput.value.trim() === "123456") {
      verifiedMsg.classList.remove("hidden");
      verifiedMsg.style.color = "#28a745";
      verifiedMsg.textContent = "Email Verified";
      next1.classList.remove("hidden");
      emailInput.setAttribute("readonly","true");
    } else {
      verifiedMsg.classList.remove("hidden");
      next1.classList.add("hidden");
      verifiedMsg.style.color = "#ff6b6b";
      verifiedMsg.textContent = "Wrong Code";
    }
  });

  // 🟢 Member type triggers payment upload
  memberTypeSelect.addEventListener("change", () => {
    paymentUploadSection.classList.toggle("hidden", memberTypeSelect.value !== "active");
  });

  // 🟢 Navigation
  function showPage(index) {
    pages.forEach((page, i) => {
      page.classList.toggle("active", i === index);
    });
    currentPage = index;
  }

  next1.addEventListener("click", () => showPage(1));
  next2.addEventListener("click", () => showPage(2));
  next3.addEventListener("click", () => {
    generateSummary();
    showPage(3);
  });

  back1.addEventListener("click", () => showPage(0));
  back2.addEventListener("click", () => showPage(1));
  back3.addEventListener("click", () => showPage(2));

  // 🟢 Go back to home page
  toHomeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // 🟢 Final summary generator
  function generateSummary() {
    const fullName = document.getElementById("fullName").value;
    const email = emailInput.value;
    const category = document.getElementById("category").value;
    const memberType = memberTypeSelect.value;

    let text = `Name: ${fullName}\n`;
    text += `Email: ${email}\n`;
    text += `Category: ${category}\n`;
    text += `Membership: ${memberType}\n`;

    /*


    NEED TO ADD SOME ADDITIONAL DETAILS
    Will add later according to the requirements


    */

    // More fields can be appended here from dynamic inputs
    summaryBox.textContent = text;
  }



  // default first page, 
  function defaultLanding() 
  {
    verifyGroup.classList.add("hidden");
    next1.classList.add("hidden");
  }


  // 🟢 Final Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Collect form data
    const name = document.getElementById("fullName").value.trim();
    const email = emailInput.value.trim();
    const phone = document.getElementById("phone").value.trim();
    // You can add more fields as needed

    // Send data to backend
    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, phone })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "thank-you.html";
      } else {
        showCustomAlert("Submission failed: " + (data.error || "Unknown error"));
      }
    })
    .catch(err => {
      showCustomAlert("Error submitting form: " + err.message);
    });
  });



// membership fee
const enrolledDate = document.getElementById("enrolled-date");

enrolledDate.addEventListener("change", () => {
  const date = enrolledDate.value.trim().toLowerCase(); // FIXED: lowercase -> lowerCase
  console.log("Entered Date:", date);


  if (date === "fall") {
       fees = 25;
       console.log("Membership Fee: $" + fees);
       document.getElementById("memberType").options[1].text = "Active Member (Fee Paid: ($" + fees + "))";
  } else if (date === "spring") {
        fees = 15;
        console.log("Membership Fee: $" + fees);
        document.getElementById("memberType").options[1].text = "Active Member (Fee Paid: ($" + fees + "))"; 
  } else if (date === "summer") {
        fees = 5;
        next3.classList.remove("hidden"); 
        console.log("Membership Fee: $" + fees);
        document.getElementById("memberType").options[1].text = "Active Member (Fee Paid: ($" + fees + "))";
  } else {
    showCustomAlert("Enter either Fall, Spring, or Summer.");
    return NaN;
  }

});






// section 2 logic

const conditionalFields = document.getElementById("conditionalFields");

next1.addEventListener("click", () => {
  // Store the selected category
  formData["category"] = document.getElementById("category").value;
  showPage(1);
  loadConditionalFields(formData["category"]);
});

function loadConditionalFields(category) {
  conditionalFields.innerHTML = ""; // Clear old content

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

function inputElement(type, id, placeholder) {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.required = true;
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
    extraFields.appendChild(inputElement("text", "major", "Enter your major"));

    extraFields.appendChild(labelElement("Degree Level"));
    extraFields.appendChild(inputElement("text", "degreeLevel", "Bachelor's/Master's/PhD"));

    extraFields.appendChild(labelElement("Start Date"));
    extraFields.appendChild(inputElement("date", "startDate", "Enter start date"));

    extraFields.appendChild(labelElement("Expected Graduation Date"));
    extraFields.appendChild(inputElement("date", "endDate", "Enter expected end date"));

  } else if (role === "staff") {
    extraFields.appendChild(labelElement("Office / Department"));
    extraFields.appendChild(inputElement("text", "department", "Enter office or department"));

    extraFields.appendChild(labelElement("Position"));
    extraFields.appendChild(inputElement("text", "position", "Enter your job title"));

    extraFields.appendChild(labelElement("Years at MSU"));
    extraFields.appendChild(inputElement("number", "years", "How many years at MSU?"));
  }

  conditionalFields.appendChild(extraFields);
}

function addAlumniFields() {
  conditionalFields.appendChild(labelElement("Major"));
  conditionalFields.appendChild(inputElement("text", "major", "Enter your major"));

  conditionalFields.appendChild(labelElement("Degree Level"));
  conditionalFields.appendChild(inputElement("text", "degreeLevel", "Bachelor's/Master's/PhD"));

  conditionalFields.appendChild(labelElement("Start Date"));
  conditionalFields.appendChild(inputElement("date", "startDate", "Enter start date"));

  conditionalFields.appendChild(labelElement("Graduation Date"));
  conditionalFields.appendChild(inputElement("date", "endDate", "Enter graduation date"));

  conditionalFields.appendChild(labelElement("Current Job / Position"));
  conditionalFields.appendChild(inputElement("text", "currentJob", "Where are you working now?"));
}

function addOthersFields() {
  conditionalFields.appendChild(labelElement("How are you affiliated with MSU?"));
  conditionalFields.appendChild(inputElement("text", "affiliation", "Enter your answer"));

  conditionalFields.appendChild(labelElement("What do you hope to gain from NSA events?"));
  conditionalFields.appendChild(inputElement("text", "expectations", "Enter your response"));
}
