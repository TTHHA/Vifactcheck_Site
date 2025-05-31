// This is a static version of the server for GitHub Pages
// It uses localStorage to store the leaderboard data

// Initial data
const initialData = [
    { team: "Baseline", model: "Gemma", fullContext: 85.94, goldEvidence: 89.90, date: "2024-03-20" }
];

// Load data from localStorage or use initial data
function loadData() {
    const storedData = localStorage.getItem('leaderboardData');
    return storedData ? JSON.parse(storedData) : initialData;
}

// Save data to localStorage
function saveData(data) {
    localStorage.setItem('leaderboardData', JSON.stringify(data));
}

// Initialize data if not exists
if (!localStorage.getItem('leaderboardData')) {
    saveData(initialData);
}

// Export functions for use in script.js
window.leaderboardAPI = {
    loadData,
    saveData
}; 