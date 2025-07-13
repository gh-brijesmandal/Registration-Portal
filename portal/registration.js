document.addEventListener("DOMContentLoaded", () => {
  const animation = document.querySelector(".nsa-animation");
  const formContainer = document.querySelector(".form-container");

  const pages = document.querySelectorAll(".form-page");
  let currentPage = 0;

  const next1 = document.getElementById("next1");
  const next2 = document.getElementById("next2");
  const next3 = document.getElementById("next3");

  const back1 = document.getElementById("back1");
  const back2 = document.getElementById("back2");
  const back3 = document.getElementById("back3");

  const restartBtn = document.getElementById("restartBtn");
  const toHomeBtn = document.getElementById("toHomeBtn");

  const emailInput = document.getElementById("email");
  const sendCodeBtn = document.getElementById("sendCodeBtn");
  const verifyGroup = document.getElementById("verifyGroup");
  const verifyCodeInput = document.getElementById("verifyCode");
  const verifiedMsg = document.getElementById("verifiedMsg");

  const memberTypeSelect = document.getElementById("memberType");
  const paymentUploadSection = document.getElementById("paymentUploadSection");

  const summaryBox = document.getElementById("summaryBox");

  const form = document.getElementById("registrationForm");

  // 🟢 Step 0: Intro animation
  setTimeout(() => {
    animation.classList.add("hide");
    setTimeout(() => {
      animation.style.display = "none";
      formContainer.classList.remove("hidden");
    }, 500);
  }, 2500);

  // 🟢 Email verification (simulate)
  sendCodeBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    if (email === "") return alert("Please enter a valid email.");
    verifyGroup.classList.remove("hidden");
    alert(`Verification code sent to ${email}`);
  });

  verifyCodeInput.addEventListener("input", () => {
    if (verifyCodeInput.value.trim() === "123456") {
      verifiedMsg.classList.remove("hidden");
      next1.classList.remove("hidden");
    } else {
      verifiedMsg.classList.add("hidden");
      next1.classList.add("hidden");
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
  restartBtn.addEventListener("click", () => showPage(0));

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

    // More fields can be appended here from dynamic inputs
    summaryBox.textContent = text;
  }

  // 🟢 Final Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Form submitted successfully!");
    form.reset();
    showPage(0);
    location.reload(); // Refresh to restart animation if needed
  });
});
