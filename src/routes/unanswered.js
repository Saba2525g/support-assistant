// src/routes/unanswered.js
import { Router } from 'express';
import { issabelPool } from '../config/db.js';

const router = Router();
let cache = { data: null, ts: 0 };
const CACHE_MS = 60_000;

router.get('/', async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_MS) {
      return res.json(cache.data);
    }

    console.log('Running unanswered query...');

    // ۱. پاک کردن جدول قبلی (جداگانه)
    await issabelPool.query('DROP TABLE IF EXISTS _cdr');

    // ۲. ساخت جدول جدید (جداگانه)
    await issabelPool.query(`
      CREATE TABLE _cdr
      SELECT b.*, c.linkedid FROM cdr b
      INNER JOIN (
        SELECT DISTINCT a.linkedid, a.uniqueid FROM cel a
        WHERE a.eventtime >= NOW() - INTERVAL 3 DAY
      ) c ON b.uniqueid = c.uniqueid
      ORDER BY b.calldate
    `);

    // ۳. اجرای کوئری اصلی
    const [rows] = await issabelPool.query(`
      SELECT 
        isMobile(w.cnum, 1) AS is_mobile,
        TIMESTAMPDIFF(SECOND, w.calldate, w.max_calldate) AS duration,
        FLOOR(TIMESTAMPDIFF(SECOND, w.calldate, w.max_calldate)/60) AS _minute,
        TIMESTAMPDIFF(SECOND, w.calldate, w.max_calldate) - FLOOR(TIMESTAMPDIFF(SECOND, w.calldate, w.max_calldate)/60)*60 AS _secound,
        w.*
      FROM (
        SELECT a.*,
          (
            SELECT b.calldate FROM _cdr b
            WHERE DATE(b.calldate) = DATE(a.calldate)
              AND CorrectNum(b.cnum) = CorrectNum(a.cnum)
              AND b.calldate > a.calldate
              AND b.disposition = 'ANSWERED'
              AND b.dst <> 's' AND b.dst <> 'hangup' AND b.dst <> '994'
            LIMIT 1
          ) AS next_answerd_in_samedate
        FROM (
          SELECT linkedid,
                 MIN(cnam) AS cnam,
                 MIN(CorrectNum(cnum)) AS cnum,
                 MIN(calldate) AS calldate,
                 MAX(calldate) AS max_calldate
          FROM _cdr
          WHERE LENGTH(cnum) > 3
            AND linkedid NOT IN (SELECT linkedid FROM _cdr WHERE disposition = 'ANSWERED')
          GROUP BY linkedid
          ORDER BY MIN(calldate) DESC
        ) a
        HAVING next_answerd_in_samedate IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM _cdr x
            WHERE x.outbound_cnam IS NOT NULL
              AND x.outbound_cnam <> ''
              AND x.lastapp <> 'Playback'
              AND x.disposition = 'ANSWERED'
              AND x.calldate > a.calldate
              AND CorrectNum(SUBSTRING(x.dst, 2)) = CorrectNum(a.cnum)
          )
      ) w
    `);

    console.log(`Unanswered query finished. Found ${rows.length} rows.`);
    cache = { data: rows, ts: Date.now() };
    res.json(rows);
  } catch (err) {
    console.error('UNANSWERED ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;