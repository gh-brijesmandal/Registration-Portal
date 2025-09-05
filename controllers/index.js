// Index page controller
document.addEventListener('DOMContentLoaded', function() {
    // Hide the start button initially
    const startBtn = document.getElementById('startBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Show loading animation for 3 seconds
    setTimeout(() => {
        loadingSpinner.style.display = 'none';
    }, 3000);
});

function startRegistration() {
    // Add fade out animation
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.style.transition = 'opacity 0.5s ease-out';
    loadingContainer.style.opacity = '0';
    
    // Navigate to registration form after animation
    setTimeout(() => {
        window.location.href = 'registration-form';
    }, 500);
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    
    startBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    startBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});
