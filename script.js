// Add an event listener for the search button
const searchButton = document.getElementById('submit-search');
searchButton.addEventListener('click', async () => {
    // Get the search bar input and selected skills
    const searchBar = document.getElementById('search-bar').value.trim();
    const skills = Array.from(document.querySelectorAll('#skills input:checked')).map(input => input.value);

    // Combine search bar input and selected skills into a single keyword string
    const keyword = [searchBar, ...skills].filter(Boolean).join(' ');

    // Check if the search bar contains only a number or is empty
    if (!keyword || !isNaN(keyword)) {
        alert('Please enter a valid job title or select skills!');
        return;
    }

    try {
        // Fetch data from the backend API
        const apiUrl = `/api/external-jobs/${encodeURIComponent(keyword)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch job data. Status: ${response.status}`);
        }

        const data = await response.json();

        // Remove any existing chart before displaying new data
        removeChart();

        // Display the search results
        displayResults(data.jobs); // Assuming your backend returns { jobs: [...] }

        // Pass data to a chart if data exists
        if (data.jobs && data.jobs.length > 0) {
            createChart(data.jobs);
        }
    } catch (error) {
        alert('Failed to fetch job data. Please check the console for details.');
        console.error('Error fetching job data:', error);
    }
});

// Function to display job search results
function displayResults(jobs) {
    const resultsArea = document.getElementById('search');
    const existingResults = document.getElementById('job-results');
    if (existingResults) {
        existingResults.remove();
    }

    const resultsSection = document.createElement('section');
    resultsSection.id = 'job-results';
    resultsSection.innerHTML = '<h2>Search Results</h2>';

    if (!jobs || jobs.length === 0) {
        resultsSection.innerHTML += '<p>No jobs found. Try different search criteria.</p>';
        resultsArea.appendChild(resultsSection);
        return;
    }

    jobs.forEach(job => {
        const jobBox = document.createElement('div');
        jobBox.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Agency:</strong> ${job.agency}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Salary:</strong> ${job.salary || 'N/A'} USD/year</p>
            <a href="${job.url}" target="_blank">View Job Posting</a>
        `;
        resultsSection.appendChild(jobBox);
    });

    resultsArea.appendChild(resultsSection);
}

// Function to create a chart with Chart.js
function createChart(jobs) {
    const chartColors = {
        background: 'rgba(75, 192, 192, 0.6)',
        border: 'rgba(75, 192, 192, 1)',
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Salaries Chart',
                font: {
                    size: 20,
                    family: 'Arial, sans-serif',
                    weight: 'bold',
                },
                color: '#333',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const chartData = {
        labels: jobs.map(job => job.title),
        datasets: [{
            label: 'Salaries (USD)',
            data: jobs.map(job => parseFloat(job.salary || 0)),
            backgroundColor: chartColors.background,
            borderColor: chartColors.border,
            borderWidth: 1,
        }],
    };

    const canvas = document.createElement('canvas');
    canvas.id = 'chart-area';
    canvas.style.marginTop = '20px';

    const resultsArea = document.getElementById('search');
    resultsArea.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: chartOptions,
    });
}

// Function to remove the chart if it exists
function removeChart() {
    const chartArea = document.getElementById('chart-area');
    if (chartArea) {
        chartArea.remove();
    }
}
