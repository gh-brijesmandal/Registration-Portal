if (performance.getEntriesByType("navigation")[0].type === "navigate") {
    document.addEventListener("DOMContentLoaded", function () {
        console.log("DOM fully loaded and parsed");

        const animation = document.querySelector(".nsa-animation");
        const container = document.querySelector(".container");

        setTimeout(() => {
            animation.classList.add("hide");

            setTimeout(() => {
                animation.style.display = "none";
                container.classList.remove("hidden");
                container.classList.add("show");
            }, 500); // Wait for fade-out transition
        }, 3000); // Wait before starting fade-out
    });
}
else {
    document.addEventListener("DOMContentLoaded", function () {
        console.log("Dom contents loaded on reload.")
        const container = document.querySelector(".container");
        const animation = document.querySelector(".nsa-animation");
        animation.style.display = "none";
        animation.classList.add("hide");
        container.classList.remove("hidden");
        container.classList.add("show");
    });
}

const registrationForm = document.getElementById("registerButton");
const adminPanel = document.getElementById("adminButton");

if (registrationForm) {
    registrationForm.addEventListener("click", () => {
        window.location.href = "registration.html";
    })
}

if (adminPanel) {
    adminPanel.addEventListener("click", () => {
        window.location.href = "admin.html";
    });
}