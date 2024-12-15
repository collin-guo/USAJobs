document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");

    const searchForm = document.getElementById('search-form');
    const saveJobsButton = document.getElementById('save-jobs-button');
    
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

    if (saveJobsButton) {
        saveJobsButton.addEventListener('click', saveSelectedJobs);
    } else {
        console.error("Save jobs button not found in the DOM.");
    }

    fetchSavedJobs(); // Fetch saved jobs on page load
});

// Chart instance
let jobChart;

async function fetchExternalJobs(keyword) {
    console.log("Fetching jobs for keyword:", keyword);
    try {
        const response = await fetch(`/api/externalJobs/${keyword}`);
        if (!response.ok) throw new Error('Error fetching jobs');
        const jobs = await response.json();
        console.log("Jobs received:", jobs);
        displayJobs(jobs, "Search Results from USAJobs", true); // Pass 'true' to enable checkbox
        displayJobChart(jobs, "Job Distribution from Search Results");
    } catch (error) {
        console.error("Error fetching jobs:", error.message);
        displayError("Error fetching jobs. Please try again later.");
    }
}

async function fetchSavedJobs() {
    console.log("Fetching saved jobs...");
    try {
        const response = await fetch('/api/getJobs');
        if (!response.ok) throw new Error('Error fetching saved jobs');
        const jobs = await response.json();
        console.log("Saved jobs received:", jobs);
        displayJobs(jobs, "Saved Jobs");
    } catch (error) {
        console.error("Error fetching saved jobs:", error.message);
        displayError("Error fetching saved jobs. Please try again later.");
    }
}

async function addJobToSupabase(job) {
    console.log("Adding job to Supabase:", job);
    try {
        const response = await fetch('/api/addJob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(job)
        });

        if (!response.ok) {
            throw new Error('Failed to add job to Supabase');
        }
        console.log("Job added successfully");

         // Show success dialog with job info
         alert(`Job added successfully:\n\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nPosted Date: ${job.posted_date}`);
    } catch (error) {
        console.error("Error adding job to Supabase:", error.message);
    }
}

async function deleteJobFromSupabase(job) {
    console.log("Deleting job from Supabase:", job);
    try {
        const response = await fetch(`/api/deleteJob/${job.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete job from Supabase');
        }
        console.log("Job deleted successfully");

        // Reload the saved jobs list after deletion
        fetchSavedJobs();
    } catch (error) {
        console.error("Error deleting job from Supabase:", error.message);
    }
}

function displayJobs(jobs, title, showCheckbox = false) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<h2>${title}</h2>`;

    const ul = document.createElement('ul');

    jobs.forEach(job => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${job.title}</strong> - ${job.company} <br>
            Location: ${job.location} <br>
            Posted on: ${job.posted_date} <br>
            <a href="${job.url}" target="_blank">View Job</a>
        `;
        jobList.appendChild(listItem);
    });

    resultsDiv.appendChild(ul);

    // Show the "Save Selected Jobs" button if checkboxes are enabled
    const saveJobsButton = document.getElementById('save-jobs-button');
    if (showCheckbox && saveJobsButton) {
        saveJobsButton.style.display = 'block';
    }

}

function displayError(message) {
    const resultsSection = document.getElementById('results');
    if (!resultsSection) {
        console.error("Results section not found in the DOM.");
        return;
    }
    resultsSection.innerHTML = `<p class="error">${message}</p>`;
}

// Display Chart
function displayJobChart(jobs, chartTitle) {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) {
        console.error("Chart container not found in the DOM.");
        return;
    }

    // Extract job data for the chart
    const companies = {};
    jobs.forEach(job => {
        companies[job.company] = (companies[job.company] || 0) + 1;
    });

    const labels = Object.keys(companies);
    const data = Object.values(companies);

    // Show the chart container
    chartContainer.style.display = 'block';

    // Destroy previous chart if it exists
    if (jobChart) {
        jobChart.destroy();
    }

    // Create a new chart
    const ctx = document.getElementById('jobChart').getContext('2d');
    jobChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Number of Jobs',
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: chartTitle,
                }
            }
        }
    });
}

// Function to save selected jobs to the backend
async function saveSelectedJobs() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const jobsToSave = [];

    checkboxes.forEach(checkbox => {
        // Each checkbox stores job details in its dataset
        const jobData = JSON.parse(checkbox.dataset.job);
        jobsToSave.push(jobData);
    });

    try {
        for (const job of jobsToSave) {
            const response = await fetch('http://localhost:3000/api/addJob', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(job),
            });

            if (!response.ok) throw new Error('Failed to save job');
        }
        alert('Selected jobs saved successfully!');
    } catch (error) {
        console.error('Error saving jobs:', error);
        alert('Error saving jobs. Please try again later.');
    }
}