// Add an event listener for the search button
const searchButton = document.getElementById('submit-search');
searchButton.addEventListener('click', async () => {
    // Get the search bar input and selected skills
    const searchBar = document.getElementById('search-bar').value.trim();
    const skills = Array.from(document.querySelectorAll('#skills input:checked'))
        .map(input => input.value); // Use the 'value' attribute for the skill

    // Combine search bar input and selected skills into a single keyword string
    const keyword = [searchBar, ...skills].filter(Boolean).join(' ');

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

        // Parse the response JSON
        const data = await response.json();

        // Display the search results
        displayResults(data.SearchResult.SearchResultItems);
    } catch (error) {
        // Log and display error message
        console.error('Error fetching job data:', error);
        const resultsArea = document.getElementById('search');
        resultsArea.innerHTML += '<p style="color:red;">Failed to fetch job data. Please check the console for details.</p>';
    }
});

// Function to display job search results
function displayResults(jobs) {
    // Select the search section to append results
    const resultsArea = document.getElementById('search');

    // Clear any previous results
    const existingResults = document.getElementById('job-results');
    if (existingResults) {
        existingResults.remove();
    }

    // Create a new section for job results
    const resultsSection = document.createElement('section');
    resultsSection.id = 'job-results';
    resultsSection.style.marginTop = '20px';

    // Add a title for the results
    resultsSection.innerHTML = '<h2>Search Results</h2>';

    if (!jobs || jobs.length === 0) {
        // Display a message if no jobs are found
        resultsSection.innerHTML += '<p>No jobs found. Try different search criteria.</p>';
        resultsArea.appendChild(resultsSection);
        return;
    }

    // Loop through the jobs and display each one in a box (div)
    jobs.forEach(job => {
        const jobBox = document.createElement('div');
        jobBox.style.marginBottom = '20px';
        jobBox.style.padding = '15px';
        jobBox.style.border = '1px solid #ddd';
        jobBox.style.borderRadius = '5px';
        jobBox.style.backgroundColor = '#ffffff';
        jobBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        jobBox.innerHTML = `
            <h3 style="margin-bottom: 10px;">${job.MatchedObjectDescriptor.PositionTitle}</h3>
            <p><strong>Agency:</strong> ${job.MatchedObjectDescriptor.OrganizationName}</p>
            <p><strong>Location:</strong> ${job.MatchedObjectDescriptor.PositionLocationDisplay}</p>
            <p><strong>Salary:</strong> ${
                job.MatchedObjectDescriptor.PositionRemuneration[0]?.MinimumRange || 'N/A'
            } USD/year</p>
            <a href="${job.MatchedObjectDescriptor.PositionURI}" target="_blank" style="color: #007BFF; text-decoration: none;">View Job Posting</a>
        `;

        // Append the job box to the results section
        resultsSection.appendChild(jobBox);
    });

    // Add the results section to the search area
    resultsArea.appendChild(resultsSection);
}