// src/routes/rejected.js
import { Router } from 'express';
import { issabelPool } from '../config/db.js';

const router = Router();
let cache = { data: null, ts: 0 };
const CACHE_MS = 30_000;

router.get('/', async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_MS) {
      return res.json(cache.data);
    }

    console.log('Running rejected query...');
    const [rows] = await issabelPool.query(`
      SELECT * FROM cdr
      WHERE dcontext = 'app-blackhole' 
         OR dcontext = 'app-announcement-3'
      ORDER BY calldate DESC
      LIMIT 100
    `);

    console.log(`Rejected query finished. Found ${rows.length} rows.`);
    cache = { data: rows, ts: Date.now() };
    res.json(rows);
  } catch (err) {
    console.error('REJECTED ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;