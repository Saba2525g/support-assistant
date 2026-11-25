// src/routes/history.js
import { Router } from 'express';
import { issabelPool } from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'شماره تماس الزامی است' });
  }

  const like = `%${number.trim()}%`;

  try {
    console.log(`Running history query for: ${number}`);
    const [rows] = await issabelPool.query(`
      SELECT 
        CASE 
          WHEN call_type = 'INBOUND' THEN 'INBOUND'
          WHEN call_type = 'OUTBOUND' THEN 'OUTBOUND'
        END AS call_type,
        call_start, call_end, duration_seconds, result,
        number_of_legs, phone_number, caller_name, src
      FROM (
        SELECT 
          'INBOUND' AS call_type, c.linkedid,
          MIN(cdr.calldate) AS call_start,
          MAX(cdr.calldate) AS call_end,
          TIMESTAMPDIFF(SECOND, MIN(cdr.calldate), MAX(cdr.calldate)) AS duration_seconds,
          CASE 
            WHEN SUM(CASE WHEN cdr.dcontext IN ('app-blackhole','app-announcement-3') THEN 1 ELSE 0 END) > 0
              THEN 'rejected'
            WHEN SUM(CASE WHEN cdr.disposition = 'ANSWERED' THEN 1 ELSE 0 END) > 0
              THEN 'answered'
            ELSE 'unanswered'
          END AS result,
          COUNT(*) AS number_of_legs,
          MIN(cdr.cnum) AS phone_number,
          MIN(cdr.cnam) AS caller_name,
          MIN(cdr.src) AS src
        FROM cdr
        INNER JOIN cel c ON cdr.uniqueid = c.uniqueid
        WHERE cdr.cnum LIKE ?
        GROUP BY c.linkedid

        UNION ALL

        SELECT 
          'OUTBOUND' AS call_type, NULL AS linkedid,
          calldate AS call_start, calldate AS call_end, billsec AS duration_seconds,
          CASE WHEN disposition = 'ANSWERED' THEN 'answered' ELSE disposition END AS result,
          1 AS number_of_legs, dst AS phone_number, outbound_cnam AS caller_name, src
        FROM cdr 
        WHERE outbound_cnam IS NOT NULL 
          AND outbound_cnam <> '' 
          AND lastapp <> 'Playback' 
          AND dst LIKE ?
      ) AS all_calls
      ORDER BY call_start DESC
    `, [like, like]);

    console.log(`History query finished. Found ${rows.length} rows.`);
    res.json(rows);
  } catch (err) {
    console.error('HISTORY ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;