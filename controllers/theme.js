// Shared theme toggle functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button icon
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
        toggleButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update toggle button icon
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
        toggleButton.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});

// Also initialize immediately in case DOMContentLoaded has already fired
initializeTheme();
