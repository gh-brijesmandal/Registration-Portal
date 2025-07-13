// intro animation
if (performance.getEntriesByType("navigation")[0].type === "navigate")
{
    const animation = document.querySelector(".nsa-animation");
    const container = document.querySelector(".container");

    setTimeout(function(e) {
        animation.classList.add("hide");
        setTimeout(() => {  
            animation.style.display = "none";
            container.classList.remove("hidden");
            container.classList.add("show");
        },500);
    },3000);
}
else 
{
    const animation = document.querySelector(".nsa-animation");
    const container = document.querySelector(".container");

    animation.classList.add("hidden");
    container.classList.remove("hidden");
    container.classList.add("show");
}

// back to home logic

if (backButton)
{
    document.getElementById("backButton").addEventListener("click", () => {
        window.location.href = "index.html";
    });
}



// form validation
document.getElementById("adminLoginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();
    const status = document.getElementById("loginStatus");

    // Example check - replace with real backend auth
    const correctEmail = "test@gmail.com";
    const correctPassword = "test123"; // Replace with backend validation

    if (email === correctEmail && password === correctPassword) {
        // success
        status.textContent = "";
        window.location.href = "dashboard.html"; // Redirect to admin panel
    } else {
        // failure
        status.textContent = "Invalid email or password.";
    }
});
