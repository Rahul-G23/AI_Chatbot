// API Base URL (use relative path so same origin works in production)
const API_BASE_URL = '/api';

// Utility Functions
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Use absolute route so server serves the correct page
    window.location.href = '/login';
}

// API Call Function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }
            throw new Error(result.message || 'API Error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Protected Route Check
function checkAuthentication() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
    }
}
