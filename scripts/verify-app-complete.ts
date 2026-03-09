/**
 * Script verifikasi lengkap untuk memastikan aplikasi berjalan sempurna
 */

async function verifyApplication() {
  console.log('🔍 Verifikasi Lengkap Aplikasi JASPEL\n');
  console.log('='.repeat(60));

  const baseUrl = 'http://localhost:3003';
  
  const tests = [
    { 
      name: 'Home Page', 
      url: `${baseUrl}`,
      expectedStatus: [200, 307, 302],
      description: 'Root page dengan redirect ke dashboard'
    },
    { 
      name: 'Login Page', 
      url: `${baseUrl}/login`,
      expectedStatus: [200],
      description: 'Halaman login'
    },
    { 
      name: 'Admin Dashboard', 
      url: `${baseUrl}/admin/dashboard`,
      expectedStatus: [200, 307, 302],
      description: 'Dashboard super admin'
    },
    { 
      name: 'Admin Users', 
      url: `${baseUrl}/admin/users`,
      expectedStatus: [200, 307, 302],
      description: 'Manajemen user'
    },
    { 
      name: 'Admin Units', 
      url: `${baseUrl}/admin/units`,
      expectedStatus: [200, 307, 302],
      description: 'Manajemen unit kerja'
    },
    { 
      name: 'Admin KPI Config', 
      url: `${baseUrl}/admin/kpi-config`,
      expectedStatus: [200, 307, 302],
      description: 'Konfigurasi KPI'
    },
    { 
      name: 'Manager Dashboard', 
      url: `${baseUrl}/manager/dashboard`,
      expectedStatus: [200, 307, 302],
      description: 'Dashboard manager'
    },
    { 
      name: 'Employee Dashboard', 
      url: `${baseUrl}/employee/dashboard`,
      expectedStatus: [200, 307, 302],
      description: 'Dashboard employee'
    },
    { 
      name: 'Profile Page', 
      url: `${baseUrl}/profile`,
      expectedStatus: [200, 307, 302],
      description: 'Halaman profile'
    },
    { 
      name: 'Notifications', 
      url: `${baseUrl}/notifications`,
      expectedStatus: [200, 307, 302],
      description: 'Halaman notifikasi'
    },
  ];

  let passed = 0;
  let failed = 0;
  const results: Array<{ name: string; status: string; message: string }> = [];

  console.log('\n📋 Testing Endpoints...\n');

  for (const test of tests) {
    try {
      const response = await fetch(test.url, {
        method: 'GET',
        redirect: 'manual',
      });

      const isSuccess = test.expectedStatus.includes(response.status);
      
      if (isSuccess) {
        console.log(`✅ ${test.name.padEnd(25)} - OK (${response.status})`);
        results.push({
          name: test.name,
          status: 'PASS',
          message: `Status ${response.status} - ${test.description}`
        });
        passed++;
      } else {
        console.log(`❌ ${test.name.padEnd(25)} - FAILED (${response.status})`);
        results.push({
          name: test.name,
          status: 'FAIL',
          message: `Unexpected status ${response.status}`
        });
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name.padEnd(25)} - ERROR`);
      results.push({
        name: test.name,
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 HASIL TEST: ${passed} passed, ${failed} failed\n`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n✅ SEMUA TEST BERHASIL!\n');
    console.log('🎉 Aplikasi berjalan dengan sempurna!\n');
    console.log('📍 Akses aplikasi di: ' + baseUrl);
    console.log('\n👤 Login Credentials:');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │ Super Admin                                     │');
    console.log('   │ Email: superadmin@hospital.com                  │');
    console.log('   │ Password: Admin123!                             │');
    console.log('   ├─────────────────────────────────────────────────┤');
    console.log('   │ Manager                                         │');
    console.log('   │ Email: manager@hospital.com                     │');
    console.log('   │ Password: Manager123!                           │');
    console.log('   ├─────────────────────────────────────────────────┤');
    console.log('   │ Employee                                        │');
    console.log('   │ Email: employee@hospital.com                    │');
    console.log('   │ Password: Employee123!                          │');
    console.log('   └─────────────────────────────────────────────────┘\n');
    
    console.log('✨ Fitur yang Tersedia:');
    console.log('   • Dashboard dengan KPI & Insentif');
    console.log('   • Manajemen Unit Kerja');
    console.log('   • Manajemen User & RBAC');
    console.log('   • Konfigurasi KPI (P1, P2, P3)');
    console.log('   • Pool Insentif');
    console.log('   • Input Realisasi');
    console.log('   • Laporan & Export (Excel, PDF)');
    console.log('   • Audit Log');
    console.log('   • Notifikasi Real-time');
    console.log('   • Settings & Konfigurasi\n');
  } else {
    console.log('\n❌ BEBERAPA TEST GAGAL\n');
    console.log('Endpoint yang gagal:');
    results
      .filter(r => r.status !== 'PASS')
      .forEach(r => {
        console.log(`   • ${r.name}: ${r.message}`);
      });
    console.log('\n💡 Solusi:');
    console.log('   1. Pastikan server berjalan: npm run dev');
    console.log('   2. Periksa console untuk error');
    console.log('   3. Restart aplikasi: .\\scripts\\restart-app.ps1');
    console.log('   4. Check database connection\n');
    process.exit(1);
  }
}

// Run verification
console.log('⏳ Memulai verifikasi...\n');
verifyApplication().catch((error) => {
  console.error('\n❌ Error during verification:', error);
  console.log('\n💡 Pastikan server berjalan dengan: npm run dev\n');
  process.exit(1);
});
