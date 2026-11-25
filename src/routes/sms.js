// src/routes/sms.js
import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// ارسال پیامک به یک شماره
router.post('/send', async (req, res) => {
  const { receptor, message } = req.body;

  if (!receptor || !message) {
    return res.status(400).json({ error: 'شماره و متن پیامک الزامی است' });
  }

  try {
    console.log(`Sending SMS to ${receptor}...`);

    // درخواست به API کاوه‌نگار
    const response = await axios.post('https://api.kavenegar.com/v1/' + process.env.SMS_API_KEY + '/sms/send.json', {
      receptor: receptor,
      sender: process.env.SMS_SENDER,
      message: message,
    });

    console.log('SMS sent successfully:', response.data);
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('SMS ERROR:', err.message);
    res.status(500).json({ error: 'خطا در ارسال پیامک: ' + err.message });
  }
});

export default router;