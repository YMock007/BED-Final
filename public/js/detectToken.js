// detectToken.js

// Function to check if the token has expired
function isTokenExpired(token) {
    if (!token) {
        return true; // Token is considered expired if it doesn't exist
    }

    const decodedToken = parseJwt(token);

    if (!decodedToken || !decodedToken.exp) {
        return true; // Unable to decode token or expiration time not available
    }

    // Get the current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    return decodedToken.exp < currentTimestamp;
}

// Function to parse JWT and return the decoded payload
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// Function to display a responsive styled warning message
function showResponsiveWarningMessage(message) {
    let warningContainer = document.getElementById('warningContainer');

    if (!warningContainer) {
        // Create a new warning container if it doesn't exist
        warningContainer = document.createElement('div');
        warningContainer.id = 'warningContainer';
        warningContainer.style.position = 'fixed';
        warningContainer.style.top = '10%';
        warningContainer.style.left = '50%';
        warningContainer.style.transform = 'translateX(-50%)';
        warningContainer.style.width = '80%';
        warningContainer.style.maxWidth = '400px'; // Set a maximum width for smaller screens
        warningContainer.style.background = '#f8d7da'; // Light red background color
        warningContainer.style.color = 'crimson'; // Dark red text color
        warningContainer.style.padding = '10px';
        warningContainer.style.textAlign = 'center';
        warningContainer.style.borderRadius = '5px';
        warningContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
        warningContainer.style.zIndex = '99999';
        document.body.appendChild(warningContainer);
    }

    // Update the warning message
    warningContainer.textContent = message;

    // Remove the warning container after 3 seconds
    setTimeout(() => {
        if (warningContainer && warningContainer.parentNode) {
            warningContainer.parentNode.removeChild(warningContainer);
        }
    }, 2000);
}

// Function to detect token expiration and show responsive styled warning if expired
function detectTokenExpiration() {
    const token = localStorage.getItem('token');

    if (isTokenExpired(token)) {
        // Token has expired, show a responsive styled warning message
        showResponsiveWarningMessage('Your session has expired. Please log in again.');
    }
}

// Call the detectTokenExpiration function when the page loads
document.addEventListener('DOMContentLoaded', detectTokenExpiration);
