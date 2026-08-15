// api/tg-to-number.js
// Developer: Darkdeveloper02
// Telegram ID to Phone Number API with Key System (Clean Response)

const axios = require('axios');

// ==================== CONFIGURATION ====================
const VALID_KEYS = [
  'a7@Z_2!',
  'DEMO_KEY_2026',
  'DARKDEV-PRO-001',
  'TG2NUM-FREE-2026'
];

const RATE_LIMIT = {
  windowMs: 60000,
  maxRequests: 30,
};

const requestLog = {};

// ==================== MAIN HANDLER ====================
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { key, userid, username } = req.query;

  // ---------- Validate Key ----------
  if (!key) {
    return res.status(401).json({
      status: false,
      error: 'API key required. Please provide a valid key.',
      developer: 'Darkdeveloper02'
    });
  }

  const validKeys = process.env.VALID_KEYS 
    ? process.env.VALID_KEYS.split(',') 
    : VALID_KEYS;

  if (!validKeys.includes(key)) {
    return res.status(403).json({
      status: false,
      error: 'Invalid API key. Please contact @Darkdeveloper02 to get a valid key.',
      developer: 'Darkdeveloper02'
    });
  }

  // ---------- Rate Limiting ----------
  const now = Date.now();
  if (!requestLog[key]) requestLog[key] = [];
  requestLog[key] = requestLog[key].filter(t => now - t < RATE_LIMIT.windowMs);

  if (requestLog[key].length >= RATE_LIMIT.maxRequests) {
    return res.status(429).json({
      status: false,
      error: 'Rate limit exceeded. Max 30 requests per minute.',
      developer: 'Darkdeveloper02'
    });
  }
  requestLog[key].push(now);

  // ---------- Validate Input ----------
  const targetId = userid || username;
  if (!targetId) {
    return res.status(400).json({
      status: false,
      error: 'Missing parameter: userid or username is required.',
      developer: 'Darkdeveloper02',
      usage: {
        example: '/tg-to-number?key=YOUR_KEY&userid=7124836834',
        params: {
          key: 'Your API key',
          userid: 'Telegram User ID (numeric)',
          username: 'Telegram Username (without @)'
        }
      }
    });
  }

  // ---------- Fetch Data ----------
  try {
    const sourceUrl = `https://tg2num-coral.vercel.app/tg-to-number?key=a7@Z_2!&userid=${targetId}`;
    const response = await axios.get(sourceUrl, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TG2Num-Clone/1.0)' }
    });

    const data = response.data;

    if (data.status === true && data.data) {
      // ✅ CLEAN RESPONSE — Only essential fields
      return res.status(200).json({
        status: true,
        data: {
          source1: data.data.source1 || null
        },
        target_id: targetId,
        target_type: userid ? 'user_id' : 'username',
        developer: 'Darkdeveloper02'
      });
    } else {
      return res.status(404).json({
        status: false,
        error: 'No data found for the provided Telegram ID/Username.',
        developer: 'Darkdeveloper02',
        target_id: targetId
      });
    }

  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (error.response) {
      return res.status(error.response.status || 500).json({
        status: false,
        error: 'Source API error: ' + (error.response.data?.error || 'Unknown error'),
        developer: 'Darkdeveloper02'
      });
    }
    return res.status(500).json({
      status: false,
      error: 'Internal server error. Please try again later.',
      developer: 'Darkdeveloper02'
    });
  }
};    const response = await axios.get(sourceUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TG2Num-Clone/1.0)'
      }
    });

    const data = response.data;

    // ========== 6. FORMAT RESPONSE ==========
    if (data.status === true && data.data) {
      return res.status(200).json({
        status: true,
        data: {
          source1: data.data.source1 || null
        },
        target_id: targetId,
        target_type: userid ? 'user_id' : 'username',
        remaining_days: data.remaining_days || 30,
        timestamp: new Date().toISOString(),
        developer: 'Darkdeveloper02',
        key_info: {
          key: key,
          remaining_requests: RATE_LIMIT.maxRequests - requestLog[key].length,
          reset_in: Math.ceil((RATE_LIMIT.windowMs - (now - (requestLog[key][0] || now))) / 1000)
        }
      });
    } else {
      return res.status(404).json({
        status: false,
        error: 'No data found for the provided Telegram ID/Username.',
        developer: 'Darkdeveloper02',
        target_id: targetId
      });
    }

  } catch (error) {
    console.error('Error fetching data:', error.message);

    if (error.response) {
      return res.status(error.response.status || 500).json({
        status: false,
        error: 'Source API error: ' + (error.response.data?.error || 'Unknown error'),
        developer: 'Darkdeveloper02'
      });
    }

    return res.status(500).json({
      status: false,
      error: 'Internal server error. Please try again later.',
      developer: 'Darkdeveloper02'
    });
  }
};
