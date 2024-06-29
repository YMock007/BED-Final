// inactiveReload.js

// Function to display a custom notification
function showNotification(message) {
    // Replace this with your preferred notification implementation
    alert(message);
}

let activityTimeout;

function reloadPage() {
    showNotification("The page will be reloaded due to inactivity, Thanks.");
    location.reload();
}

function stopAutoReload() {
    clearTimeout(activityTimeout);
}

function resetActivityTimeout() {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(reloadPage, 600000); // Reload after 10 minutess of inactivity
}

// Reset the inactivity timeout on user activity
document.addEventListener('mousemove', resetActivityTimeout);
document.addEventListener('keydown', resetActivityTimeout);

// Initial setup
resetActivityTimeout();

// Example usage of the stopAutoReload function:
// You can call this function to stop the automatic reload when needed
// stopAutoReload();
