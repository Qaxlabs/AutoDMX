const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
let metaAppSecret = 'my-local-app-secret-123'; // Default fallback

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/META_APP_SECRET=(.*)/);
  if (match && match[1]) {
    metaAppSecret = match[1].trim();
  }
}

const PORT = 3000;
const WEBHOOK_URL = `http://localhost:${PORT}/api/webhook`;

// Helper to calculate Meta Hub signature
function computeSignature(payloadString, secret) {
  return 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
}

// Helper to make POST request
function postWebhook(payload) {
  return new Promise((resolve, reject) => {
    const payloadString = JSON.stringify(payload);
    const signature = computeSignature(payloadString, metaAppSecret);

    const urlObj = new URL(WEBHOOK_URL);
    const options = {
      method: 'POST',
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payloadString);
    req.end();
  });
}

function showHelp() {
  console.log('AutoDMX Webhook Event Mock Tester');
  console.log('=================================');
  console.log('Usage:');
  console.log('  1. Simulate comment trigger on a post:');
  console.log('     node mock-trigger.js comment <IG_USER_ID> <MEDIA_ID> "<comment_text>"');
  console.log('     Example: node mock-trigger.js comment 17841400000000000 1234567890 "Send me the guide please"');
  console.log('\n  2. Simulate contact reply in DM:');
  console.log('     node mock-trigger.js dm <IG_USER_ID> <SENDER_IGSID> "<message_text>"');
  console.log('     Example: node mock-trigger.js dm 17841400000000000 mock_sender_igsid "user@example.com"');
}

async function run() {
  const args = process.argv.slice(2);
  const type = args[0];

  if (!type || (type !== 'comment' && type !== 'dm')) {
    showHelp();
    process.exit(1);
  }

  if (type === 'comment') {
    const igUserId = args[1];
    const mediaId = args[2];
    const commentText = args[3] || 'INFO';

    if (!igUserId || !mediaId) {
      console.error('Error: Missing IG_USER_ID or MEDIA_ID parameters.');
      showHelp();
      process.exit(1);
    }

    const payload = {
      object: 'instagram',
      entry: [
        {
          id: igUserId,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'comments',
              value: {
                id: `mock_comment_${Math.floor(Math.random() * 1000000)}`,
                text: commentText,
                media: {
                  id: mediaId,
                },
                from: {
                  id: 'mock_sender_igsid',
                  username: 'mock_instagram_user',
                },
              },
            },
          ],
        },
      ],
    };

    console.log(`Sending mock comment webhook...`);
    console.log(`- Text: "${commentText}"`);
    console.log(`- Post ID: ${mediaId}`);
    console.log(`- To Business ID: ${igUserId}`);

    try {
      const res = await postWebhook(payload);
      console.log(`Response Status Code: ${res.statusCode}`);
      console.log(`Response Body: ${res.data}`);
    } catch (err) {
      console.error(`Failed to post webhook:`, err.message);
    }
  }

  if (type === 'dm') {
    const igUserId = args[1];
    const senderIgsid = args[2];
    const text = args[3] || 'hello';

    if (!igUserId || !senderIgsid) {
      console.error('Error: Missing IG_USER_ID or SENDER_IGSID parameters.');
      showHelp();
      process.exit(1);
    }

    const payload = {
      object: 'instagram',
      entry: [
        {
          id: igUserId,
          time: Math.floor(Date.now() / 1000),
          messaging: [
            {
              sender: { id: senderIgsid },
              recipient: { id: igUserId },
              timestamp: Date.now(),
              message: {
                mid: `mid.mock_${Math.floor(Math.random() * 1000000)}`,
                text: text,
              },
            },
          ],
        },
      ],
    };

    console.log(`Sending mock DM message webhook...`);
    console.log(`- Text: "${text}"`);
    console.log(`- Sender ID (IGSID): ${senderIgsid}`);
    console.log(`- To Business ID: ${igUserId}`);

    try {
      const res = await postWebhook(payload);
      console.log(`Response Status Code: ${res.statusCode}`);
      console.log(`Response Body: ${res.data}`);
    } catch (err) {
      console.error(`Failed to post webhook:`, err.message);
    }
  }
}

run();
