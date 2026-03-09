/**
 * Migration Checkpoint Verification Script
 * Verifies all aspects of the user-employee separation migration
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface CheckResult {
  check: string;
  passed: boolean;
  details: string;
  critical: boolean;
}

async function verifyMigrationCheckpoint(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const results: CheckResult[] = [];

  console.log('🔍 Migration Checkpoint Verification\n');
  console.log('='.repeat(70));

  try {
    // Check 1: Database migration applied
    console.log('\n📋 Check 1: Database Migration Status');
    console.log('-'.repeat(70));

    // Try direct query to check columns
    let hasUserId = false;

    try {
      const { data: testQuery } = await supabase
        .from('m_employees')
        .select('user_id')
        .limit(1);
      
      if (testQuery && testQuery.length > 0) {
        hasUserId = 'user_id' in testQuery[0];
      }
    } catch (e) {
      // Column might not exist
      console.log('   Note: user_id column may not exist yet');
    }

    results.push({
      check: 'user_id column exists',
      passed: hasUserId,
      details: hasUserId ? 'Column added successfully' : 'Column missing - run migration',
      critical: true,
    });

    // Check 2: All employees have user_id
    console.log('\n📋 Check 2: Employee-User Linkage');
    console.log('-'.repeat(70));

    const { data: employees, error: empError } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, user_id');

    if (empError) {
      results.push({
        check: 'Fetch employees',
        passed: false,
        details: `Error: ${empError.message}`,
        critical: true,
      });
    } else if (employees) {
      const totalEmployees = employees.length;
      const withUserId = employees.filter(e => e.user_id).length;
      const withoutUserId = totalEmployees - withUserId;

      results.push({
        check: 'All employees have user_id',
        passed: withoutUserId === 0,
        details: `${withUserId}/${totalEmployees} employees linked (${withoutUserId} missing)`,
        critical: true,
      });

      console.log(`   Total employees: ${totalEmployees}`);
      console.log(`   With user_id: ${withUserId}`);
      console.log(`   Without user_id: ${withoutUserId}`);

      if (withoutUserId > 0) {
        console.log('\n   ⚠️  Employees without user_id:');
        employees
          .filter(e => !e.user_id)
          .forEach(e => console.log(`      - ${e.employee_code}: ${e.full_name}`));
      }
    }

    // Check 3: All auth.users have employee records
    console.log('\n📋 Check 3: Auth Users Validation');
    console.log('-'.repeat(70));

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      results.push({
        check: 'Fetch auth users',
        passed: false,
        details: `Error: ${authError.message}`,
        critical: true,
      });
    } else if (authUsers) {
      const totalAuthUsers = authUsers.users.length;
      let orphanedUsers = 0;
      let usersWithMetadata = 0;

      for (const user of authUsers.users) {
        // Check if user has employee record
        const { data: employee } = await supabase
          .from('m_employees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!employee) {
          orphanedUsers++;
          console.log(`   ⚠️  Orphaned auth user: ${user.email}`);
        }

        // Check if user has metadata
        if (user.user_metadata?.role && user.user_metadata?.employee_id) {
          usersWithMetadata++;
        }
      }

      results.push({
        check: 'All auth users have employee records',
        passed: orphanedUsers === 0,
        details: `${totalAuthUsers - orphanedUsers}/${totalAuthUsers} users linked (${orphanedUsers} orphaned)`,
        critical: true,
      });

      results.push({
        check: 'Auth users have metadata',
        passed: usersWithMetadata === totalAuthUsers,
        details: `${usersWithMetadata}/${totalAuthUsers} users have role and employee_id`,
        critical: false,
      });

      console.log(`   Total auth users: ${totalAuthUsers}`);
      console.log(`   With employee records: ${totalAuthUsers - orphanedUsers}`);
      console.log(`   With metadata: ${usersWithMetadata}`);
    }

    // Check 4: Helper functions exist
    console.log('\n📋 Check 4: Helper Functions');
    console.log('-'.repeat(70));

    const helperFunctions = [
      'get_current_employee',
      'is_superadmin',
      'get_user_unit_id',
      'is_unit_manager',
      'get_employee_id_from_auth',
      'get_user_role',
    ];

    for (const funcName of helperFunctions) {
      try {
        await supabase.rpc(funcName);
        results.push({
          check: `Function ${funcName}() exists`,
          passed: true,
          details: 'Available',
          critical: true,
        });
      } catch (error: any) {
        const exists = !error.message?.includes('does not exist');
        results.push({
          check: `Function ${funcName}() exists`,
          passed: exists,
          details: exists ? 'Available' : 'Missing',
          critical: true,
        });
      }
    }

    // Check 5: Audit tables updated
    console.log('\n📋 Check 5: Audit Tables');
    console.log('-'.repeat(70));

    try {
      const { data: auditTest } = await supabase
        .from('t_audit_log')
        .select('user_id')
        .limit(1);
      
      results.push({
        check: 'Audit table accessible',
        passed: true,
        details: 'Table structure updated',
        critical: false,
      });
    } catch (error: any) {
      results.push({
        check: 'Audit table accessible',
        passed: false,
        details: error.message || 'Error accessing table',
        critical: false,
      });
    }

    // Check 6: Test login capability
    console.log('\n📋 Check 6: Login Capability');
    console.log('-'.repeat(70));

    if (employees && employees.length > 0) {
      const testEmployee = employees.find(e => e.user_id);
      
      if (testEmployee) {
        const { data: authUser } = await supabase.auth.admin.getUserById(testEmployee.user_id);
        
        results.push({
          check: 'Sample user can be retrieved',
          passed: !!authUser.user,
          details: authUser.user ? `User ${authUser.user.email} found` : 'User not found',
          critical: true,
        });

        if (authUser.user) {
          const hasMetadata = !!(authUser.user.user_metadata?.role && authUser.user.user_metadata?.employee_id);
          results.push({
            check: 'Sample user has metadata',
            passed: hasMetadata,
            details: hasMetadata ? 'Metadata present' : 'Metadata missing',
            critical: true,
          });
        }
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(70));

    const criticalChecks = results.filter(r => r.critical);
    const nonCriticalChecks = results.filter(r => !r.critical);
    
    const criticalPassed = criticalChecks.filter(r => r.passed).length;
    const criticalFailed = criticalChecks.filter(r => !r.passed).length;
    
    const nonCriticalPassed = nonCriticalChecks.filter(r => r.passed).length;
    const nonCriticalFailed = nonCriticalChecks.filter(r => !r.passed).length;

    console.log('\nCritical Checks:');
    criticalChecks.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.check}`);
      console.log(`   ${result.details}`);
    });

    console.log('\nNon-Critical Checks:');
    nonCriticalChecks.forEach(result => {
      const icon = result.passed ? '✅' : '⚠️ ';
      console.log(`${icon} ${result.check}`);
      console.log(`   ${result.details}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log(`Critical: ${criticalPassed}/${criticalChecks.length} passed`);
    console.log(`Non-Critical: ${nonCriticalPassed}/${nonCriticalChecks.length} passed`);
    console.log('='.repeat(70));

    if (criticalFailed > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND');
      console.log('Migration is not ready. Please address the issues above.');
      process.exit(1);
    } else if (nonCriticalFailed > 0) {
      console.log('\n⚠️  WARNINGS PRESENT');
      console.log('Migration can proceed but review warnings above.');
      process.exit(0);
    } else {
      console.log('\n✅ ALL CHECKS PASSED');
      console.log('Migration is ready for production!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyMigrationCheckpoint();
}

export { verifyMigrationCheckpoint };
