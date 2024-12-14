import fetch from 'node-fetch';
import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(bodyParser.json());

// Supabase setup
const supabaseUrl = 'https://mappoifaerbzgjkbpghc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcHBvaWZhZXJiemdqa2JwZ2hjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDE5NTgyNSwiZXhwIjoyMDQ5NzcxODI1fQ.pyKIySn-clANZ9Dy2fo7MzSIQHjVlhs4kBEI3-w5rEQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch jobs from USAJobs and manipulate data
app.get('/api/externalJobs/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
    try {
        const apiUrl = `https://data.usajobs.gov/api/Search?Keyword=${keyword}`;
        console.log("Constructed API URL:", apiUrl);

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization-Key': 'fW4/OJhmw1jLVI16m1d7d7qVlS75lsInb/v73TpnDU0=',
                'User-Agent': 'olaleyeitunu26@gmail.com',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response Error:', errorText);
            throw new Error(`Failed to fetch external jobs for keyword: ${keyword}`);
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        const transformedData = data.SearchResult?.SearchResultItems?.map(item => ({
            id: item.MatchedObjectId || null,
            title: item.MatchedObjectDescriptor.PositionTitle || 'N/A',
            company: item.MatchedObjectDescriptor.OrganizationName || 'N/A',
            location: item.MatchedObjectDescriptor.PositionLocationDisplay || 'N/A',
            posted_date: item.MatchedObjectDescriptor.PublicationStartDate || 'N/A',
            url: item.MatchedObjectDescriptor.PositionURI || 'N/A', // Updated to use "url"
        })) || [];

        res.status(200).json(transformedData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Add job to Supabase
app.post('/api/addJob', async (req, res) => {
    const { title, company, location, posted_date, url } = req.body; // Updated to expect "url"

    try {
        const { data, error } = await supabase
            .from('jobs')
            .insert([{ title, company, location, posted_date, url }]); // Updated to use "url"

        if (error) throw error;

        res.status(201).json({ message: 'Job added successfully', data });
    } catch (error) {
        console.error('Error adding job:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get jobs from Supabase
app.get('/api/getJobs', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});