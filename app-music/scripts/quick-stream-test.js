#!/usr/bin/env node

/**
 * Script rápido para probar transmisión en vivo
 * Más simple que test-live-stream-flow.js
 *
 * Uso: node scripts/quick-stream-test.js
 */

const API_URL = 'http://localhost:3000';

async function request(method, path, data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  });

  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.message}`);
  return result;
}

async function main() {
  console.log('\n🎵 Test Rápido de Transmisión en Vivo\n');

  try {
    // 1. Crear usuarios
    console.log('1️⃣  Creando usuarios...');
    const creator = await request('POST', '/auth/register', {
      email: `creator-${Date.now()}@test.com`,
      password: 'Test123!',
      userType: 'creator',
      profile: { displayName: 'DJ Test' },
    });
    const creatorId = creator.data.user.id;
    const creatorToken = (
      await request('POST', '/auth/login', {
        email: creator.data.user.email,
        password: 'Test123!',
      })
    ).data.token;

    const subscriber = await request('POST', '/auth/register', {
      email: `subscriber-${Date.now()}@test.com`,
      password: 'Test123!',
      userType: 'subscriber',
      profile: { displayName: 'Listener' },
    });
    const subscriberId = subscriber.data.user.id;
    const subscriberToken = (
      await request('POST', '/auth/login', {
        email: subscriber.data.user.email,
        password: 'Test123!',
      })
    ).data.token;

    console.log(`   ✅ Creator: ${creator.data.user.email}`);
    console.log(`   ✅ Subscriber: ${subscriber.data.user.email}\n`);

    // 2. Crear transmisión
    console.log('2️⃣  Creando transmisión...');
    const stream = await request(
      'POST',
      '/live/streams',
      {
        title: 'Test Stream',
        description: 'Quick test',
        scheduledFor: new Date(Date.now() + 60000).toISOString(),
      },
      creatorToken
    );
    const streamId = stream.data.id;
    console.log(`   ✅ Stream ID: ${streamId}\n`);

    // 3. Generar código de acceso
    console.log('3️⃣  Generando código de acceso...');
    const code = await request(
      'POST',
      '/access/generate',
      {
        creatorId,
        paymentId: `pay-${Date.now()}`,
        amount: 999,
        currency: 'USD',
        durationDays: 30,
      },
      creatorToken
    );
    console.log(`   ✅ Código: ${code.data.code}\n`);

    // 4. Subscriber compra acceso
    console.log('4️⃣  Subscriber compra acceso...');
    await request(
      'POST',
      '/access/redeem',
      {
        code: code.data.code,
      },
      subscriberToken
    );
    console.log(`   ✅ Acceso comprado\n`);

    // 5. Iniciar transmisión
    console.log('5️⃣  Iniciando transmisión...');
    const live = await request(
      'PATCH',
      `/live/streams/${streamId}`,
      {
        status: 'live',
      },
      creatorToken
    );
    console.log(`   ✅ Estado: ${live.data.status.toUpperCase()}\n`);

    // 6. Subscriber se conecta
    console.log('6️⃣  Subscriber se conecta...');
    const viewer = await request('POST', `/live/streams/${streamId}/viewers`, {}, subscriberToken);
    console.log(`   ✅ Viewer ID: ${viewer.data.viewerId}\n`);

    // 7. Obtener estado
    console.log('7️⃣  Estado actual:');
    const status = await request('GET', `/live/streams/${streamId}`, null, subscriberToken);
    console.log(`   📊 Viewers: ${status.data.viewerCount}`);
    console.log(`   🎵 Título: ${status.data.title}`);
    console.log(`   🔴 Estado: ${status.data.status.toUpperCase()}\n`);

    console.log('✨ ¡Test completado!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
