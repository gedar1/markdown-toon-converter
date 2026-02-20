/**
 * Script para simular una transmisión en vivo y compra de suscripción
 *
 * Flujo:
 * 1. Creator registra y crea una transmisión programada
 * 2. Subscriber ve la transmisión disponible
 * 3. Subscriber compra acceso
 * 4. Creator inicia la transmisión (cambia estado a "live")
 * 5. Subscriber se conecta y escucha
 *
 * Uso: node scripts/test-live-stream-flow.js
 */

const API_URL = 'http://localhost:3000';

async function request(method, path, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${path}`, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status}: ${result.message || 'Request failed'}`);
  }

  return result;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎵 Simulador de Transmisión en Vivo\n');
  console.log('='.repeat(50));

  try {
    // ========== PASO 1: REGISTRAR CREATOR ==========
    console.log('\n📝 PASO 1: Registrando Creator...');
    const creatorEmail = `creator-${Date.now()}@test.com`;
    const creatorRegister = await request('POST', '/auth/register', {
      email: creatorEmail,
      password: 'Test123!',
      userType: 'creator',
      profile: {
        displayName: 'DJ Mike',
        bio: 'Electronic music producer',
        avatarUrl: null,
      },
    });
    const creatorId = creatorRegister.data.user.id;
    console.log(`✅ Creator registrado: ${creatorEmail}`);
    console.log(`   ID: ${creatorId}`);

    // ========== PASO 2: LOGIN CREATOR ==========
    console.log('\n🔐 PASO 2: Login como Creator...');
    const creatorLogin = await request('POST', '/auth/login', {
      email: creatorEmail,
      password: 'Test123!',
    });
    const creatorToken = creatorLogin.data.token;
    console.log('✅ Creator autenticado');

    // ========== PASO 3: CREAR TRANSMISIÓN PROGRAMADA ==========
    console.log('\n📅 PASO 3: Creando transmisión programada...');
    const scheduledTime = new Date(Date.now() + 5 * 60000); // 5 minutos en el futuro
    const liveStreamResult = await request(
      'POST',
      '/live/streams',
      {
        title: 'Friday Night Electronic Mix',
        description: 'Deep house and techno session',
        scheduledFor: scheduledTime.toISOString(),
      },
      creatorToken
    );
    const streamId = liveStreamResult.data.id;
    const streamKey = liveStreamResult.data.streamKey;
    console.log(`✅ Transmisión programada: ${liveStreamResult.data.title}`);
    console.log(`   ID: ${streamId}`);
    console.log(`   Programada para: ${scheduledTime.toLocaleString()}`);
    console.log(`   Stream Key: ${streamKey}`);

    // ========== PASO 4: REGISTRAR SUBSCRIBER ==========
    console.log('\n👤 PASO 4: Registrando Subscriber...');
    const subscriberEmail = `subscriber-${Date.now()}@test.com`;
    const subscriberRegister = await request('POST', '/auth/register', {
      email: subscriberEmail,
      password: 'Test123!',
      userType: 'subscriber',
      profile: {
        displayName: 'Music Lover',
        bio: null,
        avatarUrl: null,
      },
    });
    const subscriberId = subscriberRegister.data.user.id;
    console.log(`✅ Subscriber registrado: ${subscriberEmail}`);
    console.log(`   ID: ${subscriberId}`);

    // ========== PASO 5: LOGIN SUBSCRIBER ==========
    console.log('\n🔐 PASO 5: Login como Subscriber...');
    const subscriberLogin = await request('POST', '/auth/login', {
      email: subscriberEmail,
      password: 'Test123!',
    });
    const subscriberToken = subscriberLogin.data.token;
    console.log('✅ Subscriber autenticado');

    // ========== PASO 6: SUBSCRIBER VE TRANSMISIÓN PROGRAMADA ==========
    console.log('\n👀 PASO 6: Subscriber descubre transmisión programada...');
    const scheduledStreams = await request('GET', '/live/streams/scheduled', null, subscriberToken);
    const foundStream = scheduledStreams.data.find((s) => s.id === streamId);
    if (foundStream) {
      console.log(`✅ Transmisión encontrada en lista de programadas`);
      console.log(`   Título: ${foundStream.title}`);
      console.log(`   Creator: ${foundStream.creator.displayName}`);
    }

    // ========== PASO 7: GENERAR CÓDIGO DE ACCESO ==========
    console.log('\n💳 PASO 7: Creator genera código de acceso...');
    const accessCodeResult = await request(
      'POST',
      '/access/generate',
      {
        creatorId: creatorId,
        paymentId: `payment-${Date.now()}`,
        amount: 999, // $9.99
        currency: 'USD',
        durationDays: 30,
      },
      creatorToken
    );
    const accessCode = accessCodeResult.data.code;
    console.log(`✅ Código de acceso generado: ${accessCode}`);
    console.log(`   Precio: $9.99`);
    console.log(`   Duración: 30 días`);

    // ========== PASO 8: SUBSCRIBER COMPRA ACCESO ==========
    console.log('\n🛒 PASO 8: Subscriber compra acceso...');
    const redeemResult = await request(
      'POST',
      '/access/redeem',
      {
        code: accessCode,
      },
      subscriberToken
    );
    console.log('✅ Acceso comprado exitosamente');
    console.log(`   Grant ID: ${redeemResult.data.accessGrantId}`);
    console.log(`   Expira: ${new Date(redeemResult.data.expiresAt).toLocaleString()}`);

    // ========== PASO 9: VALIDAR ACCESO ==========
    console.log('\n✔️  PASO 9: Validando acceso del subscriber...');
    const validateResult = await request(
      'GET',
      `/access/validate/${creatorId}`,
      null,
      subscriberToken
    );
    console.log(
      `✅ Acceso validado: ${validateResult.data.hasAccess ? '✅ ACTIVO' : '❌ INACTIVO'}`
    );

    // ========== PASO 10: ESPERAR Y INICIAR TRANSMISIÓN ==========
    console.log('\n⏳ PASO 10: Esperando para iniciar transmisión...');
    console.log('   (En producción, el creator usaría OBS/Streamlabs)');
    console.log('   Simulando inicio de transmisión en 3 segundos...');
    await delay(3000);

    // ========== PASO 11: CAMBIAR ESTADO A LIVE ==========
    console.log('\n🔴 PASO 11: Creator inicia transmisión (LIVE)...');
    const liveUpdateResult = await request(
      'PATCH',
      `/live/streams/${streamId}`,
      {
        status: 'live',
      },
      creatorToken
    );
    console.log(`✅ Transmisión iniciada`);
    console.log(`   Estado: ${liveUpdateResult.data.status.toUpperCase()}`);
    console.log(`   Viewers: ${liveUpdateResult.data.viewerCount}`);

    // ========== PASO 12: SUBSCRIBER SE CONECTA ==========
    console.log('\n🎧 PASO 12: Subscriber se conecta a la transmisión...');
    const viewerResult = await request(
      'POST',
      `/live/streams/${streamId}/viewers`,
      {},
      subscriberToken
    );
    console.log('✅ Subscriber conectado');
    console.log(`   Viewer ID: ${viewerResult.data.viewerId}`);
    console.log(`   Playback URL: ${liveUpdateResult.data.playbackUrl}`);

    // ========== PASO 13: OBTENER ESTADO DE TRANSMISIÓN ==========
    console.log('\n📊 PASO 13: Obteniendo estado actual de transmisión...');
    const streamStatus = await request('GET', `/live/streams/${streamId}`, null, subscriberToken);
    console.log(`✅ Estado de transmisión:`);
    console.log(`   Título: ${streamStatus.data.title}`);
    console.log(`   Estado: ${streamStatus.data.status.toUpperCase()}`);
    console.log(`   Viewers activos: ${streamStatus.data.viewerCount}`);
    console.log(`   Duración: ${streamStatus.data.duration}s`);

    // ========== PASO 14: OBTENER TRANSMISIONES ACTIVAS ==========
    console.log('\n🔴 PASO 14: Listando transmisiones activas...');
    const activeStreams = await request('GET', '/live/streams/active', null, subscriberToken);
    console.log(`✅ Transmisiones activas: ${activeStreams.data.length}`);
    activeStreams.data.forEach((stream) => {
      console.log(
        `   - ${stream.creator.displayName}: ${stream.title} (${stream.viewerCount} viewers)`
      );
    });

    // ========== RESUMEN FINAL ==========
    console.log('\n' + '='.repeat(50));
    console.log('✨ SIMULACIÓN COMPLETADA EXITOSAMENTE\n');
    console.log('📋 RESUMEN:');
    console.log(`   Creator: ${creatorEmail}`);
    console.log(`   Subscriber: ${subscriberEmail}`);
    console.log(`   Transmisión: ${liveStreamResult.data.title}`);
    console.log(`   Código de acceso: ${accessCode}`);
    console.log(`   Acceso: ✅ ACTIVO`);
    console.log(`   Estado: 🔴 EN VIVO`);
    console.log(`   Viewers: ${streamStatus.data.viewerCount}`);
    console.log('\n🎵 ¡El subscriber está escuchando la transmisión!');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Asegúrate de que:');
    console.error('   1. El servidor está corriendo en http://localhost:3000');
    console.error('   2. La base de datos está conectada');
    console.error('   3. Las migraciones están aplicadas');
    process.exit(1);
  }
}

main();
