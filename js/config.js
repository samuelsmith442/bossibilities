// API Configuration
const config = {
    // Development
    development: {
        apiUrl: 'http://localhost:3000'
    },
    // Production
    production: {
        apiUrl: 'https://bossibilities-1.onrender.com' // Updated Render.com URL
    }
};

// Get current environment
const environment = window.location.hostname === 'localhost' ? 'development' : 'production';

// Export API URL
export const API_URL = config[environment].apiUrl;
