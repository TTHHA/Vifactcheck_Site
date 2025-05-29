// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

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

// Demo section functionality
const demoTextarea = document.querySelector('.demo-input textarea');
const analyzeButton = document.querySelector('.analyze-button');
const resultCard = document.querySelector('.result-card');
const resultContent = document.querySelector('.result-content');
const statusSpan = document.querySelector('.status');
const confidenceSpan = document.querySelector('.confidence');

analyzeButton.addEventListener('click', () => {
    const text = demoTextarea.value.trim();
    
    if (!text) {
        alert('Please enter some text to analyze');
        return;
    }

    // Show loading state
    analyzeButton.disabled = true;
    analyzeButton.textContent = 'Analyzing...';
    resultContent.innerHTML = '<p>Analyzing content...</p>';
    
    // Simulate API call with timeout
    setTimeout(() => {
        // Randomly determine if the content is verified or not
        const isVerified = Math.random() > 0.3;
        const confidence = Math.floor(Math.random() * 20) + 80; // Random confidence between 80-100
        
        // Update UI
        statusSpan.textContent = isVerified ? 'Verified' : 'Unverified';
        statusSpan.className = `status ${isVerified ? 'verified' : 'unverified'}`;
        confidenceSpan.textContent = `${confidence}% Confidence`;
        
        // Generate sample analysis
        const analysis = generateAnalysis(text, isVerified);
        resultContent.innerHTML = analysis;
        
        // Reset button
        analyzeButton.disabled = false;
        analyzeButton.textContent = 'Analyze';
    }, 2000);
});

function generateAnalysis(text, isVerified) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const analysis = [];
    
    analysis.push('<div class="analysis-summary">');
    analysis.push(`<p class="summary">${isVerified ? 
        'The content appears to be accurate and well-supported by reliable sources.' : 
        'The content contains some inaccuracies or unverified claims.'}</p>`);
    analysis.push('</div>');
    
    analysis.push('<div class="analysis-details">');
    analysis.push('<h4>Key Findings:</h4>');
    analysis.push('<ul>');
    
    // Generate sample findings
    const findings = [
        'Source verification completed',
        'Cross-referenced with reliable databases',
        'Checked for factual consistency',
        'Analyzed context and claims'
    ];
    
    findings.forEach(finding => {
        analysis.push(`<li>${finding}</li>`);
    });
    
    analysis.push('</ul>');
    analysis.push('</div>');
    
    return analysis.join('');
}

// Add scroll-based animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .demo-container, .hero-content').forEach(el => {
    observer.observe(el);
});

// Mobile menu functionality
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const navLinks = document.querySelector('.nav-links');

mobileMenuButton.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuButton.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        navLinks.classList.remove('active');
        const icon = mobileMenuButton.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuButton.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Download data functionality
const downloadBtn = document.getElementById('download-data');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const csvContent = `Check ID,Status,Confidence\n1,Verified,98%\n2,False,85%\n3,Verified,97%\n4,Verified,99%\n5,False,80%`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vifactcheck_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Render analysis charts with Chart.js
window.addEventListener('DOMContentLoaded', function() {
    // Pie Chart: Verified vs False
    const pieCtx = document.getElementById('analysisPieChart');
    if (pieCtx && window.Chart) {
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Verified Accurate', 'Flagged as False'],
                datasets: [{
                    data: [97, 3],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)', // primary
                        'rgba(239, 68, 68, 0.8)'  // error
                    ],
                    borderColor: [
                        'rgba(37, 99, 235, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#1f2937',
                            font: { size: 14 }
                        }
                    },
                    title: { display: false }
                }
            }
        });
    }

    // Bar Chart: Checks Over Time (sample data)
    const barCtx = document.getElementById('analysisBarChart');
    if (barCtx && window.Chart) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Verified',
                        data: [1200, 1500, 1700, 1600, 1800, 2000],
                        backgroundColor: 'rgba(37, 99, 235, 0.7)'
                    },
                    {
                        label: 'False',
                        data: [80, 100, 120, 110, 90, 100],
                        backgroundColor: 'rgba(239, 68, 68, 0.7)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#1f2937',
                            font: { size: 14 }
                        }
                    },
                    title: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: '#1f2937' },
                        grid: { color: 'rgba(31,41,55,0.05)' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#1f2937' },
                        grid: { color: 'rgba(31,41,55,0.05)' }
                    }
                }
            }
        });
    }

    // Doughnut Chart: Source Distribution (sample data)
    const doughnutCtx = document.getElementById('analysisDoughnutChart');
    if (doughnutCtx && window.Chart) {
        new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['News', 'Social Media', 'Academic', 'Other'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(251, 191, 36, 0.8)'
                    ],
                    borderColor: [
                        'rgba(37, 99, 235, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(251, 191, 36, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#1f2937',
                            font: { size: 14 }
                        }
                    },
                    title: { display: false }
                }
            }
        });
    }
});

// Citation copy functionality
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', function() {
        const format = this.dataset.format;
        const citationText = this.previousElementSibling;
        const textToCopy = format === 'bibtex' 
            ? citationText.querySelector('pre').textContent
            : citationText.querySelector('p').textContent;

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            this.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy citation. Please try again.');
        });
    });
}); 