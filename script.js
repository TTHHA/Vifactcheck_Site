// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to your backend
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Add scroll-based animations
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.feature-card, .step');
    
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        // If element is in viewport
        if(position.top < window.innerHeight && position.bottom >= 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});

// Initialize elements with opacity 0
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.feature-card, .step');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
});

// Model performance across different instance sizes
const instancesData = {
    labels: ['1000', '2000', '3000', '4000', '5000'],
    datasets: [
        {
            label: 'PhoBERT Large',
            data: [0.623, 0.6802, 0.6925, 0.7033, 0.7156],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4
        },
        {
            label: 'XLM-R Large',
            data: [0.63, 0.7837, 0.7986, 0.8026, 0.784],
            borderColor: '#45B7D1',
            backgroundColor: 'rgba(69, 183, 209, 0.1)',
            tension: 0.4
        },
        {
            label: 'Gemma',
            data: [0.786, 0.828, 0.8508, 0.8623, 0.8594],
            borderColor: '#96CEB4',
            backgroundColor: 'rgba(150, 206, 180, 0.1)',
            tension: 0.4
        }
    ]
};

// Model performance across different topics
const topicsData = {
    labels: ['Law', 'World', 'Economic', 'Sports', 'Politics', 'Culture', 'Headlines', 'Health', 'Education', 'Science', 'Entertainment', 'National security'],
    datasets: [
        {
            label: 'PhoBERT Large',
            data: [0.681, 0.734, 0.7466, 0.765, 0.8158, 0.7402, 0.7121, 0.6862, 0.7019, 0.608, 0.7374, 0.6834],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4
        },
        {
            label: 'XLM-R Large',
            data: [0.6668, 0.7961, 0.7159, 0.7668, 0.7534, 0.7423, 0.7293, 0.7111, 0.6981, 0.6603, 0.7047, 0.7575],
            borderColor: '#45B7D1',
            backgroundColor: 'rgba(69, 183, 209, 0.1)',
            tension: 0.4
        },
        {
            label: 'Gemma',
            data: [0.8013, 0.8761, 0.8539, 0.8725, 0.8661, 0.8949, 0.848, 0.8067, 0.8601, 0.8735, 0.854, 0.93],
            borderColor: '#96CEB4',
            backgroundColor: 'rgba(150, 206, 180, 0.1)',
            tension: 0.4
        },
        {
            label: 'Gemini',
            data: [0.7423, 0.7515, 0.793, 0.7514, 0.7713, 0.7524, 0.7571, 0.7495, 0.8055, 0.74, 0.6984, 0.7374],
            borderColor: '#FFEEAD',
            backgroundColor: 'rgba(255, 238, 173, 0.1)',
            tension: 0.4
        }
    ]
};

// Model performance with different retrieval methods
const retrievalData = {
    labels: ['Top-1', 'Top-2', 'Top-3', 'Top-4', 'Top-5'],
    datasets: {
        bm25: [
            {
                label: 'PhoBERT Large',
                data: [52.21, 52.74, 53.84, 57.09, 50.40],
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4
            },
            {
                label: 'XLM-R Large',
                data: [53.45, 53.81, 59.19, 62.33, 57.41],
                borderColor: '#45B7D1',
                backgroundColor: 'rgba(69, 183, 209, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemma',
                data: [56.64, 54.21, 55.36, 60.13, 61.84],
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemini 1.5 Flash',
                data: [26.58, 33.63, 40.63, 44.80, 47.71],
                borderColor: '#96CEB4',
                backgroundColor: 'rgba(150, 206, 180, 0.1)',
                tension: 0.4
            }
        ],
        sbert: [
            {
                label: 'PhoBERT Large',
                data: [60.50, 72.12, 72.6, 74.86, 71.47],
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4
            },
            {
                label: 'XLM-R Large',
                data: [69.61, 77, 79.93, 81.05, 78.75],
                borderColor: '#45B7D1',
                backgroundColor: 'rgba(69, 183, 209, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemma',
                data: [69.99, 76.76, 81.85, 82.46, 82.85],
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemini 1.5 Flash',
                data: [61.77, 68.43, 71.87, 72.56, 73.96],
                borderColor: '#96CEB4',
                backgroundColor: 'rgba(150, 206, 180, 0.1)',
                tension: 0.4
            }
        ],
        combined: [
            {
                label: 'PhoBERT Large',
                data: [56.59, 55.07, 63.01, 61.77, 64.33],
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4
            },
            {
                label: 'XLM-R Large',
                data: [61.22, 66.15, 66.83, 68.82, 79.17],
                borderColor: '#45B7D1',
                backgroundColor: 'rgba(69, 183, 209, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemma',
                data: [63.22, 69.21, 70.34, 72.31, 74.22],
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemini 1.5 Flash',
                data: [47.35, 51.64, 54.44, 55.29, 55.24],
                borderColor: '#96CEB4',
                backgroundColor: 'rgba(150, 206, 180, 0.1)',
                tension: 0.4
            }
        ]
    }
};

// Model performance by text length
const lengthData = {
    labels: ['0-100', '100-200', '200-300', '300-400', '400-500', '500-600', '600-700', '700-800', '800-900', '900-1000', '1000-1500', '>1500'],
    datasets: {
        performance: [
            {
                label: 'PhoBERT Large',
                data: [100.00, 77.65, 71.58, 78.83, 65.05, 67.45, 70.76, 69.73, 71.73, 68.74, 70.60, 78.36],
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4
            },
            {
                label: 'XLM-R Large',
                data: [76.19, 77.58, 73.79, 73.69, 67.26, 71.07, 72.98, 67.78, 73.06, 72.36, 66.99, 73.89],
                borderColor: '#45B7D1',
                backgroundColor: 'rgba(69, 183, 209, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemma',
                data: [80.00, 95.68, 86.94, 88.52, 85.86, 87.88, 84.38, 82.59, 87.78, 86.74, 84.00, 71.43],
                borderColor: '#96CEB4',
                backgroundColor: 'rgba(150, 206, 180, 0.1)',
                tension: 0.4
            },
            {
                label: 'Gemini',
                data: [80.00, 89.36, 73.50, 75.34, 74.71, 79.08, 76.59, 75.09, 83.44, 73.34, 77.26, 66.93],
                borderColor: '#FFEEAD',
                backgroundColor: 'rgba(255, 238, 173, 0.1)',
                tension: 0.4
            }
        ],
        amount: {
            label: 'Amount Data',
            data: [0.347, 2.8, 11.18, 15.42, 15.6, 13.75, 11.25, 6.25, 8.05, 5.486, 7.1, 1.32],
            backgroundColor: 'rgba(129, 191, 218, 0.5)',
            type: 'bar',
            yAxisID: 'y1'
        }
    }
};

// Common chart options
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 12
                }
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'F1-score (%)'
            }
        }
    }
};

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Performance Chart (Instance Size)
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'line',
            data: instancesData,
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    x: {
                        title: {
                            display: true,
                            text: 'Number of Instances'
                        }
                    }
                }
            }
        });
    }

    // Evidence Chart (Retrieval Methods)
    const evidenceCtx = document.getElementById('evidenceChart');
    if (evidenceCtx) {
        const evidenceChart = new Chart(evidenceCtx, {
            type: 'line',
            data: {
                labels: retrievalData.labels,
                datasets: retrievalData.datasets.bm25
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    x: {
                        title: {
                            display: true,
                            text: 'Top-K Retrieved Evidences'
                        }
                    }
                }
            }
        });

        // Create buttons for switching between retrieval methods
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'retrieval-buttons';
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginBottom = '1rem';

        const methods = ['BM25', 'SBERT', 'Combined'];
        methods.forEach(method => {
            const button = document.createElement('button');
            button.textContent = method;
            button.className = 'retrieval-button';
            button.style.margin = '0 0.5rem';
            button.style.padding = '0.5rem 1rem';
            button.style.border = '1px solid #ccc';
            button.style.borderRadius = '4px';
            button.style.backgroundColor = 'white';
            button.style.cursor = 'pointer';
            
            button.addEventListener('click', () => {
                const methodKey = method.toLowerCase();
                evidenceChart.data.datasets = retrievalData.datasets[methodKey];
                evidenceChart.update();
                
                // Update button styles
                document.querySelectorAll('.retrieval-button').forEach(btn => {
                    btn.style.backgroundColor = 'white';
                    btn.style.color = '#333';
                });
                button.style.backgroundColor = '#D71313';
                button.style.color = 'white';
            });
            
            buttonContainer.appendChild(button);
        });

        // Insert buttons before the chart
        evidenceCtx.parentElement.insertBefore(buttonContainer, evidenceCtx);
        
        // Set initial active button
        buttonContainer.firstChild.style.backgroundColor = '#D71313';
        buttonContainer.firstChild.style.color = 'white';
    }

    // Topics Chart
    const topicsCtx = document.getElementById('topicsChart');
    if (topicsCtx) {
        new Chart(topicsCtx, {
            type: 'line',
            data: topicsData,
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // Length Chart
    const lengthCtx = document.getElementById('lengthChart');
    if (lengthCtx) {
        new Chart(lengthCtx, {
            type: 'line',
            data: {
                labels: lengthData.labels,
                datasets: [...lengthData.datasets.performance, lengthData.datasets.amount]
            },
            options: {
                ...chartOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 40,
                        max: 105,
                        title: {
                            display: true,
                            text: 'Performance (%)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        max: 20,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Amount Data (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Length Range'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
});

// Add animation to stat cards
const statCards = document.querySelectorAll('.stat-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

statCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease-out';
    observer.observe(card);
});

// Leaderboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    const sortBySelect = document.getElementById('sortBy');
    const refreshButton = document.getElementById('refreshLeaderboard');

    // Function to format date
    function formatDate(dateString) {
        if (!dateString) return '-';
        // Add 'T00:00:00Z' to ensure it's parsed as UTC midnight
        const date = new Date(dateString.length === 10 ? dateString + 'T00:00:00Z' : dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Function to format number to 2 decimal places
    function formatNumber(num) {
        return Number(num).toFixed(2);
    }

    // Function to add loading state
    function setLoading(isLoading) {
        if (isLoading) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">
                        <div class="loading-spinner"></div>
                        Loading leaderboard data...
                    </td>
                </tr>
            `;
            refreshButton.disabled = true;
            sortBySelect.disabled = true;
        } else {
            refreshButton.disabled = false;
            sortBySelect.disabled = false;
        }
    }

    // Function to update the leaderboard
    async function updateLeaderboard() {
        setLoading(true);
        try {
            const sortBy = sortBySelect.value;
            const response = await fetch(`/api/leaderboard?sortBy=${sortBy}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard data');
            }

            const data = await response.json();
            
            // Clear existing table content
            leaderboardBody.innerHTML = '';

            if (data.length === 0) {
                leaderboardBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-message">
                            No data available in the leaderboard yet.
                        </td>
                    </tr>
                `;
                return;
            }

            // Add new rows
            data.forEach((entry, index) => {
                const row = document.createElement('tr');
                const delta = entry.delta;
                const deltaClass = delta > 0 ? 'positive-delta' : delta < 0 ? 'negative-delta' : '';
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.team}</td>
                    <td>${entry.model}</td>
                    <td>${formatNumber(entry.fullContext)}</td>
                    <td>${formatNumber(entry.goldEvidence)}</td>
                    <td class="${deltaClass}">${delta > 0 ? '+' : ''}${formatNumber(delta)}</td>
                    <td>${formatDate(entry.date)}</td>
                `;
                leaderboardBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error updating leaderboard:', error);
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Failed to load leaderboard data. Please try again later.
                    </td>
                </tr>
            `;
        } finally {
            setLoading(false);
        }
    }

    // Event listeners
    sortBySelect.addEventListener('change', updateLeaderboard);
    refreshButton.addEventListener('click', () => {
        const icon = refreshButton.querySelector('i');
        icon.classList.add('rotating');
        updateLeaderboard().finally(() => {
            setTimeout(() => {
                icon.classList.remove('rotating');
            }, 500);
        });
    });

    // Initial load
    updateLeaderboard();

    // Auto-refresh every 5 minutes
    setInterval(updateLeaderboard, 5 * 60 * 1000);
});