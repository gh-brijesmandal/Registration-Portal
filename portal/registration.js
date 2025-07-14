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
    // tell the user that the form submission was successful.
    showCustomAlert("Form submitted successfully!");
    console.log("Form Submitted Successfully");
    // read in form data and display it to the console
    formData["name"] = document.getElementById("fullName").value.trim();
    formData["email"] = emailInput.value.trim();
    formData["category"] = document.getElementById("category").value;
    formData["member"] = memberTypeSelect.value;
    console.log(formData);
    form.reset();
    showPage(0);
    defaultLanding();
  });
