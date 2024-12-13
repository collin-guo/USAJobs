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
        // Display an alert if no valid input is provided (empty or number)
        alert('Please enter a valid job title or select skills!');
        return;
    }

    // Construct the API URL
    const apiUrl = `https://data.usajobs.gov/api/search?Keyword=${encodeURIComponent(keyword)}`;

    // Set the required headers for the API
    const headers = {
        'Host': 'data.usajobs.gov',
        'User-Agent': 'your@email.address', // Replace with your email
        'Authorization-Key': 'LjB4XZQmodPXqocSVJx6S3hi1P/wVMJs0hkjJVl5WEA=' // Replace with your API key
    };

    try {
        // Fetch data from the USA Jobs API
        const response = await fetch(apiUrl, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Remove any existing chart before displaying new data
        removeChart();

        // Display the search results
        displayResults(data.SearchResult.SearchResultItems);

        // Example: Pass data to a chart if data exists
        if (data.SearchResult.SearchResultItems.length > 0) {
            createChart(data.SearchResult.SearchResultItems);
        }
    } catch (error) {
        // Display a simple alert for API errors
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
            <h3>${job.MatchedObjectDescriptor.PositionTitle}</h3>
            <p><strong>Agency:</strong> ${job.MatchedObjectDescriptor.OrganizationName}</p>
            <p><strong>Location:</strong> ${job.MatchedObjectDescriptor.PositionLocationDisplay}</p>
            <p><strong>Salary:</strong> ${
                job.MatchedObjectDescriptor.PositionRemuneration[0]?.MinimumRange || 'N/A'
            } USD/year</p>
            <a href="${job.MatchedObjectDescriptor.PositionURI}" target="_blank">View Job Posting</a>
        `;

        resultsSection.appendChild(jobBox);
    });

    resultsArea.appendChild(resultsSection);
}

// Function to create a chart with Chart.js
function createChart(jobs) {
    const chartArea = document.getElementById('chart-area');
    if (chartArea) chartArea.remove();  // Ensure the chart area is cleared before adding a new one

    const canvas = document.createElement('canvas');
    canvas.id = 'chart-area';
    canvas.style.marginTop = '20px';

    const resultsArea = document.getElementById('search');
    resultsArea.appendChild(canvas);

    const jobTitles = jobs.map(job => job.MatchedObjectDescriptor.PositionTitle);
    const salaries = jobs.map(
        job => parseFloat(job.MatchedObjectDescriptor.PositionRemuneration[0]?.MinimumRange || 0)
    );

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: jobTitles,
            datasets: [{
                label: 'Salaries (USD)',
                data: salaries,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',  // Increased opacity (less transparent)
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Salaries Chart',  // The title text
                    font: {
                        size: 20,  // Adjust title font size
                        family: 'Arial, sans-serif',  // Set title font family
                        weight: 'bold'  // Make the title bold
                    },
                    color: '#333'  // Set title color
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to remove the chart if it exists
function removeChart() {
    const chartArea = document.getElementById('chart-area');
    if (chartArea) {
        chartArea.remove();  // Remove the existing chart before adding a new one
    }
}
