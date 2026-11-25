// src/routes/phonebook.js
import { Router } from 'express';
import { passakPool } from '../config/db.js';

const router = Router();

router.get('/count/:number', async (req, res) => {
  const { number } = req.params;

  try {
    const [rows] = await passakPool.query(`
      SELECT COUNT(*) AS c FROM phone_book
      WHERE RIGHT(tel,8) = RIGHT(?,8)
         OR RIGHT(tel2,8) = RIGHT(?,8)
         OR RIGHT(tel3,8) = RIGHT(?,8)
         OR RIGHT(mobile,8) = RIGHT(?,8)
         OR RIGHT(mobile2,8) = RIGHT(?,8)
         OR RIGHT(mobile3,8) = RIGHT(?,8)
         OR RIGHT(fax,8) = RIGHT(?,8)
         OR RIGHT(fax2,8) = RIGHT(?,8)
    `, Array(8).fill(number));

    res.json({ count: rows[0].c });
  } catch (err) {
    console.error('PHONEBOOK ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;