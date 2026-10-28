require('dotenv').config(); // must be the first line

const path = require('path');
const express = require('express');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the web page (public/index.html, style.css, script.js)
// This must come BEFORE the routes below.
app.use(express.static(path.join(__dirname, 'public')));

// Health check (moved to /api so that "/" shows the web page)
app.get('/api', (req, res) => {
  res.json({ message: 'Task API is ready!', version: 'MySQL + MVC' });
});

// Every route inside taskRoutes starts with /tasks
app.use('/tasks', taskRoutes);

// Error handler (4 parameters) - must be after all routes
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('GET    /api');
  console.log('GET    /tasks');
  console.log('POST   /tasks');
  console.log('GET    /tasks/:id');
  console.log('PUT    /tasks/:id');
  console.log('PATCH  /tasks/:id');
  console.log('DELETE /tasks/:id');
});