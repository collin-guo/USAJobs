document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            const keyword = document.getElementById('search-keyword').value;
            console.log("Search initiated with keyword:", keyword);
            fetchExternalJobs(keyword);
        });
    } else {
        console.error("Search form not found in the DOM.");
    }

    fetchSavedJobs(); // Fetch saved jobs on page load
});

async function fetchExternalJobs(keyword) {
    console.log("Fetching jobs for keyword:", keyword);
    try {
        const response = await fetch(`http://localhost:3000/api/externalJobs/${keyword}`);
        console.log("API response:", response);
        if (!response.ok) throw new Error('Error fetching jobs');
        const jobs = await response.json();
        console.log("Jobs received:", jobs);
        displayJobs(jobs, "Search Results from USAJobs");
    } catch (error) {
        console.error("Error fetching jobs:", error.message);
        displayError("Error fetching jobs. Please try again later.");
    }
}

async function fetchSavedJobs() {
    console.log("Fetching saved jobs...");
    try {
        const response = await fetch('http://localhost:3000/api/getJobs');
        console.log("Saved jobs response:", response);
        if (!response.ok) throw new Error('Error fetching saved jobs');
        const jobs = await response.json();
        console.log("Saved jobs received:", jobs);
        displayJobs(jobs, "Saved Jobs");
    } catch (error) {
        console.error("Error fetching saved jobs:", error.message);
        displayError("Error fetching saved jobs. Please try again later.");
    }
}

function displayJobs(jobs, title) {
    const resultsSection = document.getElementById('results');
    if (!resultsSection) {
        console.error("Results section not found in the DOM.");
        return;
    }

    resultsSection.innerHTML = `<h3>${title}</h3>`;

    if (jobs.length === 0) {
        resultsSection.innerHTML += '<p>No jobs found.</p>';
        return;
    }

    const jobList = document.createElement('ul');
    jobs.forEach(job => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${job.title}</strong> - ${job.company}<br>
            Location: ${job.location}<br>
            Posted on: ${job.posted_date}<br>
            <a href="${job.url}" target="_blank">View Job</a>
        `;
        jobList.appendChild(listItem);
    });

    resultsSection.appendChild(jobList);
}

function displayError(message) {
    const resultsSection = document.getElementById('results');
    if (!resultsSection) {
        console.error("Results section not found in the DOM.");
        return;
    }
    resultsSection.innerHTML = `<p class="error">${message}</p>`;
}
