/**
 * Dev Stream Test Script
 *
 * Simulates the full streaming lifecycle to test notifications and UI
 * without needing real RTMP infrastructure.
 *
 * Usage: npx tsx scripts/dev-stream-test.ts
 *
 * Prerequisites:
 *   - Backend running (npm run dev)
 *   - At least one creator and one subscriber user in the database
 *   - An active AccessGrant between the subscriber and creator
 *
 * Environment variables (or .env):
 *   - API_URL (default: http://localhost:3000)
 *   - CREATOR_EMAIL / CREATOR_PASSWORD
 *   - SUBSCRIBER_EMAIL / SUBSCRIBER_PASSWORD
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CREATOR_EMAIL = process.env.CREATOR_EMAIL || 'gedar1@example.com';
const CREATOR_PASSWORD = process.env.CREATOR_PASSWORD || 'Password123';
const SUBSCRIBER_EMAIL = process.env.SUBSCRIBER_EMAIL || 'gedar1-sus@example.com';
const SUBSCRIBER_PASSWORD = process.env.SUBSCRIBER_PASSWORD || 'Password123';

// ============================================
// Helpers
// ============================================

async function apiRequest(
  method: string,
  path: string,
  body?: object,
  token?: string,
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${method} ${path} failed: ${res.status} - ${JSON.stringify(data)}`);
  }
  return data;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(step: string, message: string, data?: any) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`\n[${timestamp}] 🎬 ${step}`);
  console.log(`   ${message}`);
  if (data) {
    console.log(`   →`, JSON.stringify(data, null, 2).split('\n').join('\n   '));
  }
}

// ============================================
// Main Flow
// ============================================

async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║     🎵 Dev Stream Test - Simulation Script       ║
║                                                  ║
║  This script simulates the full streaming         ║
║  lifecycle to test notifications and UI.          ║
╚══════════════════════════════════════════════════╝

API: ${API_URL}
Creator: ${CREATOR_EMAIL}
Subscriber: ${SUBSCRIBER_EMAIL}
  `);

  // Step 1: Login as Creator
  log('STEP 1', 'Logging in as Creator...');
  const creatorAuth = await apiRequest('POST', '/auth/login', {
    email: CREATOR_EMAIL,
    password: CREATOR_PASSWORD,
  });
  const creatorToken = creatorAuth.data.token;
  const creatorId = creatorAuth.data.user.id;
  log('STEP 1 ✅', `Creator logged in: ${creatorAuth.data.user.displayName}`, {
    userId: creatorId,
  });

  // Step 2: Login as Subscriber
  log('STEP 2', 'Logging in as Subscriber...');
  const subAuth = await apiRequest('POST', '/auth/login', {
    email: SUBSCRIBER_EMAIL,
    password: SUBSCRIBER_PASSWORD,
  });
  const subToken = subAuth.data.token;
  log('STEP 2 ✅', `Subscriber logged in: ${subAuth.data.user.displayName}`, {
    userId: subAuth.data.user.id,
  });

  // Step 3: Creator creates a live stream
  log('STEP 3', 'Creator creating live stream...');
  const streamData = await apiRequest(
    'POST',
    '/live/streams',
    {
      title: '🎧 Friday Night Mix - DEV TEST',
      description: 'Testing live stream simulation with notifications',
      recordingEnabled: false,
    },
    creatorToken,
  );
  const stream = streamData.data;
  log('STEP 3 ✅', 'Live stream created!', {
    streamId: stream.id,
    streamKey: stream.streamKey,
    rtmpUrl: stream.rtmpUrl,
    status: stream.status,
  });

  console.log('\n   ⏳ Waiting 2 seconds before starting stream...\n');
  await sleep(2000);

  // Step 4: Simulate stream start (webhook)
  log('STEP 4', 'Simulating stream START webhook...');
  log('', '📡 This triggers Socket.IO notification → "stream:started"');
  const startResult = await apiRequest('POST', '/live/webhooks/stream/start', {
    streamKey: stream.streamKey,
  });
  log('STEP 4 ✅', 'Stream is now LIVE!', {
    streamId: startResult.data.id,
    status: startResult.data.status,
  });

  console.log('\n   🔔 Check your browser — a notification toast should appear!\n');
  console.log('   ⏳ Stream will remain live for 10 seconds...\n');
  await sleep(25000);

  // Step 5: Subscriber joins the stream
  log('STEP 5', 'Subscriber joining the stream...');
  try {
    await apiRequest('POST', `/live/streams/${stream.id}/join`, undefined, subToken);
    log('STEP 5 ✅', 'Subscriber joined successfully!');
  } catch (error) {
    log('STEP 5 ⚠️', `Join failed (may need AccessGrant): ${(error as Error).message}`);
  }

  console.log('\n   ⏳ Viewing for 5 seconds...\n');
  await sleep(5000);

  // Step 6: Get stream stats
  log('STEP 6', 'Fetching stream statistics...');
  try {
    const stats = await apiRequest('GET', `/live/streams/${stream.id}/stats`, undefined, creatorToken);
    log('STEP 6 ✅', 'Stream stats:', stats.data);
  } catch (error) {
    log('STEP 6 ⚠️', `Stats fetch failed: ${(error as Error).message}`);
  }

  // Step 7: Subscriber leaves
  log('STEP 7', 'Subscriber leaving stream...');
  try {
    await apiRequest('POST', `/live/streams/${stream.id}/leave`, undefined, subToken);
    log('STEP 7 ✅', 'Subscriber left the stream');
  } catch (error) {
    log('STEP 7 ⚠️', `Leave failed: ${(error as Error).message}`);
  }

  // Step 8: End the stream
  log('STEP 8', 'Creator ending the stream...');
  log('', '📡 This triggers Socket.IO notification → "stream:ended"');
  const endResult = await apiRequest(
    'POST',
    `/live/streams/${stream.id}/end`,
    undefined,
    creatorToken,
  );
  log('STEP 8 ✅', 'Stream ended!', {
    streamId: endResult.data.id,
    status: endResult.data.status,
    duration: endResult.data.duration,
  });

  console.log(`
╔══════════════════════════════════════════════════╗
║     ✅ Simulation Complete!                       ║
║                                                  ║
║  Check the browser for:                           ║
║  • "stream:started" toast notification            ║
║  • "stream:ended" toast notification              ║
║  • LiveStreams page auto-updating                  ║
║  • Browser console for Socket.IO logs             ║
╚══════════════════════════════════════════════════╝
  `);
}

main().catch((error) => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});
