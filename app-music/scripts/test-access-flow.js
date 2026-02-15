/**
 * Script para probar el flujo completo de acceso en desarrollo
 *
 * Uso: node scripts/test-access-flow.js
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

async function main() {
  console.log('🚀 Iniciando prueba del flujo de acceso...\n');

  try {
    // 1. Registrar Creator
    console.log('1️⃣  Registrando creator...');
    const creatorRegister = await request('POST', '/auth/register', {
      email: `creator-${Date.now()}@test.com`,
      password: 'Test123!',
      userType: 'creator',
      profile: {
        displayName: 'Test Creator',
        bio: 'Creator de prueba',
        avatarUrl: null,
      },
    });
    console.log('✅ Creator registrado:', creatorRegister.data.user.email);

    // 2. Login Creator
    console.log('\n2️⃣  Login como creator...');
    const creatorLogin = await request('POST', '/auth/login', {
      email: creatorRegister.data.user.email,
      password: 'Test123!',
    });
    const creatorToken = creatorLogin.data.token;
    const creatorId = creatorLogin.data.user.id; // Cambiado de userId a id
    console.log('✅ Creator autenticado:', creatorId);

    // 3. Generar código de acceso
    console.log('\n3️⃣  Generando código de acceso...');
    const accessCodeResult = await request(
      'POST',
      '/access/generate',
      {
        creatorId: creatorId,
        paymentId: `payment-${Date.now()}`,
        amount: 999,
        currency: 'USD',
        durationDays: 30,
      },
      creatorToken
    );
    const accessCode = accessCodeResult.data.code;
    console.log('✅ Código generado:', accessCode);

    // 4. Registrar Subscriber
    console.log('\n4️⃣  Registrando subscriber...');
    const subscriberRegister = await request('POST', '/auth/register', {
      email: `subscriber-${Date.now()}@test.com`,
      password: 'Test123!',
      userType: 'subscriber',
      profile: {
        displayName: 'Test Subscriber',
        bio: null,
        avatarUrl: null,
      },
    });
    console.log('✅ Subscriber registrado:', subscriberRegister.data.user.email);

    // 5. Login Subscriber
    console.log('\n5️⃣  Login como subscriber...');
    const subscriberLogin = await request('POST', '/auth/login', {
      email: subscriberRegister.data.user.email,
      password: 'Test123!',
    });
    const subscriberToken = subscriberLogin.data.token;
    const subscriberId = subscriberLogin.data.user.id; // Cambiado de userId a id
    console.log('✅ Subscriber autenticado:', subscriberId);

    // 6. Canjear código
    console.log('\n6️⃣  Canjeando código de acceso...');
    const redeemResult = await request(
      'POST',
      '/access/redeem',
      {
        code: accessCode,
      },
      subscriberToken
    );
    console.log('✅ Código canjeado exitosamente');
    console.log('   Grant ID:', redeemResult.data.accessGrantId);
    console.log('   Expira:', redeemResult.data.expiresAt);

    // 7. Validar acceso
    console.log('\n7️⃣  Validando acceso...');
    const validateResult = await request(
      'GET',
      `/access/validate/${creatorId}`,
      null,
      subscriberToken
    );
    console.log('✅ Acceso validado:', validateResult.data.hasAccess ? 'SÍ' : 'NO');

    // 8. Obtener grants del subscriber
    console.log('\n8️⃣  Obteniendo grants del subscriber...');
    const grantsResult = await request('GET', '/access/my-grants', null, subscriberToken);
    console.log('✅ Grants activos:', grantsResult.data.length);

    console.log('\n✨ ¡Prueba completada exitosamente!\n');
    console.log('📋 Resumen:');
    console.log('   Creator:', creatorRegister.data.user.email);
    console.log('   Subscriber:', subscriberRegister.data.user.email);
    console.log('   Código:', accessCode);
    console.log('   Acceso:', validateResult.data.hasAccess ? '✅ Activo' : '❌ Inactivo');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
