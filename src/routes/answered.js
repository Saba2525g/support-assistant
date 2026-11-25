// src/routes/answered.js
import { Router } from 'express';
import { issabelPool } from '../config/db.js';

const router = Router();
let cache = { data: null, ts: 0 };
const CACHE_MS = 30_000; // ۳۰ ثانیه کش

router.get('/', async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_MS) {
      return res.json(cache.data);
    }

    console.log('Running answered query...');
    const [rows] = await issabelPool.query(`
      SELECT 
        calldate, clid, dst, duration, billsec, disposition,
        (duration - billsec) AS waitin, src
      FROM cdr
      WHERE 
        DATE(calldate) = CURRENT_DATE()
        AND disposition = 'ANSWERED'
        AND dst < 900
        AND dst NOT LIKE 's' AND dst NOT LIKE 'i' AND dst NOT LIKE 't' AND dst NOT LIKE 'hangup'
      ORDER BY calldate DESC
    `);

    console.log(`Answered query finished. Found ${rows.length} rows.`);
    cache = { data: rows, ts: Date.now() };
    res.json(rows);
  } catch (err) {
    console.error('ANSWERED ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;