const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Starting AutoDMX API Verification Tests ===\n');

  // Test 1: GET /api/webhook verification handshake (Success)
  try {
    const res = await makeRequest(
      `${BASE_URL}/api/webhook?hub.mode=subscribe&hub.challenge=test_challenge_123&hub.verify_token=my-local-verify-token-123`
    );
    console.log('Test 1: Webhook GET handshake verification (Valid token)');
    console.log(`- Status Code: ${res.statusCode} (Expected: 200)`);
    console.log(`- Response Body: "${res.data}" (Expected: "test_challenge_123")`);
    if (res.statusCode === 200 && res.data === 'test_challenge_123') {
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  } catch (err) {
    console.error('❌ Test 1 Error:', err.message, '\n');
  }

  // Test 2: GET /api/webhook verification handshake (Invalid token)
  try {
    const res = await makeRequest(
      `${BASE_URL}/api/webhook?hub.mode=subscribe&hub.challenge=test_challenge_123&hub.verify_token=wrong-token`
    );
    console.log('Test 2: Webhook GET handshake verification (Invalid token)');
    console.log(`- Status Code: ${res.statusCode} (Expected: 403)`);
    if (res.statusCode === 403) {
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  } catch (err) {
    console.error('❌ Test 2 Error:', err.message, '\n');
  }

  // Test 3: GET /api/cron/drain-queue verification (Valid secret)
  try {
    const res = await makeRequest(`${BASE_URL}/api/cron/drain-queue`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer my-cron-secret-123',
      },
    });
    console.log('Test 3: Cron GET queue drain (Valid Authorization Header)');
    console.log(`- Status Code: ${res.statusCode} (Expected: 200)`);
    console.log(`- Response: ${res.data}`);
    if (res.statusCode === 200) {
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  } catch (err) {
    console.error('❌ Test 3 Error:', err.message, '\n');
  }

  // Test 4: GET /api/cron/drain-queue verification (Invalid secret)
  try {
    const res = await makeRequest(`${BASE_URL}/api/cron/drain-queue`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer wrong-secret',
      },
    });
    console.log('Test 4: Cron GET queue drain (Invalid Authorization Header)');
    console.log(`- Status Code: ${res.statusCode} (Expected: 401)`);
    if (res.statusCode === 401) {
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  } catch (err) {
    console.error('❌ Test 4 Error:', err.message, '\n');
  }

  // Test 5: GET /r/[id] redirect (Non-existent link ID)
  try {
    const res = await makeRequest(`${BASE_URL}/r/11111111-2222-3333-4444-555555555555`);
    console.log('Test 5: Redirect GET /r/[id] (Invalid Link ID)');
    console.log(`- Status Code: ${res.statusCode} (Expected: 404)`);
    if (res.statusCode === 404) {
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  } catch (err) {
    console.error('❌ Test 5 Error:', err.message, '\n');
  }

  console.log('=== Verification Tests Completed ===');
}

runTests();
