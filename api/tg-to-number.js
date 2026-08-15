// api/tg-to-number.js
// Developer: Darkdeveloper02
// Telegram ID to Phone Number API with Key System

const axios = require('axios');

// ==================== CONFIGURATION ====================
// Valid keys - Add your keys here
// You can also use environment variables: process.env.VALID_KEYS
const VALID_KEYS = [
  'a7@Z_2!',           // Default key
  'DEMO_KEY_2026',
  'DARKDEV-PRO-001',
  'TG2NUM-FREE-2026'
];

// Rate limiting (requests per minute per key)
const RATE_LIMIT = {
  windowMs: 60000,      // 1 minute
  maxRequests: 30,      // 30 requests per minute
};

// Request tracking for rate limiting
const requestLog = {};

// ==================== MAIN HANDLER ====================
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ========== 1. GET PARAMETERS ==========
  const { key, userid, username } = req.query;

  // ========== 2. VALIDATE KEY ==========
  if (!key) {
    return res.status(401).json({
      status: false,
      error: 'API key required. Please provide a valid key.',
      developer: 'Darkdeveloper02'
    });
  }

  // Check if key is valid
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

  // ========== 3. RATE LIMITING ==========
  const now = Date.now();
  if (!requestLog[key]) {
    requestLog[key] = [];
  }

  // Clean old requests
  requestLog[key] = requestLog[key].filter(
    timestamp => now - timestamp < RATE_LIMIT.windowMs
  );

  if (requestLog[key].length >= RATE_LIMIT.maxRequests) {
    return res.status(429).json({
      status: false,
      error: 'Rate limit exceeded. Max 30 requests per minute per key.',
      developer: 'Darkdeveloper02',
      remaining: 0,
      resetIn: Math.ceil((RATE_LIMIT.windowMs - (now - requestLog[key][0])) / 1000)
    });
  }

  // Log this request
  requestLog[key].push(now);

  // ========== 4. VALIDATE INPUT ==========
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

  // ========== 5. FETCH DATA FROM SOURCE ==========
  try {
    // Build the target URL (using the original API as source)
    const sourceUrl = `https://tg2num-coral.vercel.app/tg-to-number?key=a7@Z_2!&userid=${targetId}`;

    const response = await axios.get(sourceUrl, {
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
