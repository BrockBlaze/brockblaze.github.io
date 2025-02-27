// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('light-theme')) {
        html.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    }
}

// Apply saved theme on page load
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    }
}

// Apply theme immediately when script loads
applyTheme(); 