const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Supabase configuration
const supabaseUrl = 'https://mappoifaerbzgjkbpghc.supabase.co'; // Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFhZXJiemdqa2JwZ2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTU4MjUsImV4cCI6MjA0OTc3MTgyNX0.l4VQw0Q7zmGazANjBtdeKjHmKad-NXNxmLWFIE9YzPs'; // Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

// API Endpoints
// Endpoint 1: Retrieve Data from Database
app.get('/api/getJobs', async (req, res) => {
    try {
        const { data, error } = await supabase.from('jobs').select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 2: Save Data to Database
app.post('/api/saveJobSearch', async (req, res) => {
    const { keyword, results } = req.body;
    try {
        const { data, error } = await supabase
            .from('job_searches')
            .insert([{ keyword, results }]);
        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Additional Endpoint: Fetch Data from an External API and Return Manipulated Results
app.get('/api/externalJobs/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
    try {
        // Fetch data from an external API (e.g., USA Jobs API)
        const apiUrl = `https://data.usajobs.gov/api/jobs?Keyword=${keyword}`;
        const response = await fetch(apiUrl, {
            headers: {
                'Host': 'data.usajobs.gov',
                'User-Agent': 'olaleyeitunu26@gmail.com',
                'Authorization-Key': 'fW4/OJhmw1jLVI16m1d7d7qVlS75lsInb/v73TpnDU0='
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch external jobs for keyword: ${keyword}`);
        }

        const data = await response.json();

        // Manipulate data (e.g., filter or map it)
        const transformedData = data?.Jobs?.map(job => ({
            title: job.Title,
            company: job.CompanyName,
            location: job.Location,
            postedDate: job.PostedDate,
            salary: job.Salary || 'N/A'
        })) || [];

        res.status(200).json(transformedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Server setup
const PORT = 3000; // You can use any available port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));