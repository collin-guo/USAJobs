import fetch from 'node-fetch';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ✅ PostgreSQL RDS setup
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile('home.html', { root: __dirname });
});

// 🔍 Get jobs from USAJobs API
app.get('/api/externalJobs/:keyword', async (req, res) => {
  const keyword = req.params.keyword;
  try {
    const apiUrl = `https://data.usajobs.gov/api/Search?Keyword=${keyword}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization-Key': 'fW4/OJhmw1jLVI16m1d7d7qVlS75lsInb/v73TpnDU0=',
        'User-Agent': 'olaleyeitunu26@gmail.com',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch external jobs: ${errorText}`);
    }

    const data = await response.json();
    const transformedData = data.SearchResult?.SearchResultItems?.map(item => ({
      id: item.MatchedObjectId || null,
      title: item.MatchedObjectDescriptor.PositionTitle || 'N/A',
      company: item.MatchedObjectDescriptor.OrganizationName || 'N/A',
      location: item.MatchedObjectDescriptor.PositionLocationDisplay || 'N/A',
      posted_date: item.MatchedObjectDescriptor.PublicationStartDate || 'N/A',
      url: item.MatchedObjectDescriptor.PositionURI || 'N/A',
    })) || [];

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error fetching external jobs:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📥 Get saved jobs from RDS
app.get('/api/getJobs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ➕ Add a job to RDS
app.post('/api/addJob', async (req, res) => {
  const { title, company, location, posted_date, url } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO jobs (title, company, location, posted_date, url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, company, location, posted_date, url]
    );
    res.status(201).json({ message: 'Job added successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error adding job:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ❌ Delete a job from RDS
app.delete('/api/deleteJob/:id', async (req, res) => {
  const jobId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [jobId]);
    res.status(200).json({ message: 'Job deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting job:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
