// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { issabelPool, passakPool } from './config/db.js';
import unansweredRoutes from './routes/unanswered.js';
import answeredRoutes from './routes/answered.js';
import rejectedRoutes from './routes/rejected.js';
import dialedRoutes from './routes/dialed.js';
import historyRoutes from './routes/history.js';
import phonebookRoutes from './routes/phonebook.js';
import smsRoutes from './routes/sms.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/sms', smsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const status = { issabel: 'unknown', passak: 'unknown' };

  try {
    const [rows] = await issabelPool.query('SELECT COUNT(*) AS c FROM cdr');
    status.issabel = `OK (${rows[0].c} cdr rows)`;
  } catch (e) {
    status.issabel = `FAILED: ${e.code || e.message}`;
  }

  try {
    const [rows] = await passakPool.query('SELECT COUNT(*) AS c FROM phone_book');
    status.passak = `OK (${rows[0].c} phone_book rows)`;
  } catch (e) {
    status.passak = `FAILED: ${e.code || e.message}`;
  }

  res.json({
    server: 'running',
    time: new Date().toISOString(),
    databases: status,
  });
});

// Routes
app.use('/api/unanswered', unansweredRoutes);
app.use('/api/answered', answeredRoutes);
app.use('/api/rejected', rejectedRoutes);
app.use('/api/dialed', dialedRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/phonebook', phonebookRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.url });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({ error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log('================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/api/health`);
  console.log('================================');
});