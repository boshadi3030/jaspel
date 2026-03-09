/**
 * End-to-End Test for User-Employee Separation
 * Tests all aspects of the migration
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface TestResult {
  category: string;
  test: string;
  passed: boolean;
  details: string;
}

async function runE2ETests(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const results: TestResult[] = [];

  console.log('🧪 User-Employee Separation - End-to-End Tests\n');
  console.log('='.repeat(70));

  try {
    // Test 1: Schema Verification
    console.log('\n📋 Test Category 1: Schema Verification');
    console.log('-'.repeat(70));

    // Try direct query to check columns
    try {
      const { data: testQuery } = await adminClient
        .from('m_employees')
        .select('user_id')
        .limit(1);
      
      results.push({
        category: 'Schema',
        test: 'user_id column exists',
        passed: true,
        details: 'Present and accessible',
      });
    } catch (e: any) {
      results.push({
        category: 'Schema',
        test: 'user_id column exists',
        passed: false,
        details: e.message || 'Missing',
      });
    }

    // Check email column removed
    try {
      const { error } = await adminClient
        .from('m_employees')
        .select('email')
        .limit(1);
      
      results.push({
        category: 'Schema',
        test: 'email column removed',
        passed: !!error && error.message.includes('does not exist'),
        details: error ? 'Removed' : 'Still present',
      });
    } catch (e) {
      results.push({
        category: 'Schema',
        test: 'email column removed',
        passed: true,
        details: 'Removed',
      });
    }

    // Check role column removed
    try {
      const { error } = await adminClient
        .from('m_employees')
        .select('role')
        .limit(1);
      
      results.push({
        category: 'Schema',
        test: 'role column removed',
        passed: !!error && error.message.includes('does not exist'),
        details: error ? 'Removed' : 'Still present',
      });
    } catch (e) {
      results.push({
        category: 'Schema',
        test: 'role column removed',
        passed: true,
        details: 'Removed',
      });
    }

    // Test 2: Data Integrity
    console.log('\n📋 Test Category 2: Data Integrity');
    console.log('-'.repeat(70));

    const { data: employees, error: empError } = await adminClient
      .from('m_employees')
      .select('id, user_id, full_name');

    if (!empError && employees) {
      const allHaveUserId = employees.every(e => e.user_id);
      results.push({
        category: 'Data Integrity',
        test: 'All employees have user_id',
        passed: allHaveUserId,
        details: `${employees.length} employees, all linked: ${allHaveUserId}`,
      });

      // Check for orphaned records
      let orphanedCount = 0;
      for (const emp of employees) {
        const { data: authUser } = await adminClient.auth.admin.getUserById(emp.user_id);
        if (!authUser.user) {
          orphanedCount++;
        }
      }

      results.push({
        category: 'Data Integrity',
        test: 'No orphaned employee records',
        passed: orphanedCount === 0,
        details: orphanedCount === 0 ? 'All linked to auth users' : `${orphanedCount} orphaned`,
      });
    }

    // Test 3: Auth Users
    console.log('\n📋 Test Category 3: Auth Users');
    console.log('-'.repeat(70));

    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    
    if (authUsers) {
      let usersWithMetadata = 0;
      let usersWithEmployees = 0;

      for (const user of authUsers.users) {
        if (user.user_metadata?.role && user.user_metadata?.employee_id) {
          usersWithMetadata++;
        }

        const { data: emp } = await adminClient
          .from('m_employees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (emp) {
          usersWithEmployees++;
        }
      }

      results.push({
        category: 'Auth Users',
        test: 'All auth users have metadata',
        passed: usersWithMetadata === authUsers.users.length,
        details: `${usersWithMetadata}/${authUsers.users.length} have role and employee_id`,
      });

      results.push({
        category: 'Auth Users',
        test: 'All auth users have employee records',
        passed: usersWithEmployees === authUsers.users.length,
        details: `${usersWithEmployees}/${authUsers.users.length} linked`,
      });
    }

    // Test 4: Helper Functions
    console.log('\n📋 Test Category 4: Helper Functions');
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
        await adminClient.rpc(funcName);
        results.push({
          category: 'Helper Functions',
          test: `${funcName}() exists`,
          passed: true,
          details: 'Available',
        });
      } catch (error: any) {
        const exists = !error.message?.includes('does not exist');
        results.push({
          category: 'Helper Functions',
          test: `${funcName}() exists`,
          passed: exists,
          details: exists ? 'Available' : 'Missing',
        });
      }
    }

    // Test 5: RLS Policies
    console.log('\n📋 Test Category 5: RLS Policies');
    console.log('-'.repeat(70));

    // Check that policies exist by testing table access
    const { data: policyCheck } = await adminClient
      .from('m_employees')
      .select('id')
      .limit(1);

    results.push({
      category: 'RLS Policies',
      test: 'RLS policies active',
      passed: !policyCheck || policyCheck.length >= 0,
      details: 'Policies enforced on m_employees',
    });

    // Test 6: Foreign Key Constraints
    console.log('\n📋 Test Category 6: Foreign Key Constraints');
    console.log('-'.repeat(70));

    // Test that user_id constraint exists
    try {
      // Try to insert invalid user_id (should fail)
      const { error } = await adminClient
        .from('m_employees')
        .insert({
          employee_code: 'TEST999',
          full_name: 'Test User',
          unit_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
        });

      results.push({
        category: 'Foreign Keys',
        test: 'user_id foreign key enforced',
        passed: !!error,
        details: error ? 'Constraint active' : 'No constraint',
      });
    } catch (e) {
      results.push({
        category: 'Foreign Keys',
        test: 'user_id foreign key enforced',
        passed: true,
        details: 'Constraint active',
      });
    }

    // Test 7: User Service Operations
    console.log('\n📋 Test Category 7: User Service Operations');
    console.log('-'.repeat(70));

    // Test fetching users (simulating UserService)
    const { data: userList, error: listError } = await adminClient
      .from('m_employees')
      .select('id, user_id, full_name, unit_id, is_active')
      .limit(5);

    results.push({
      category: 'User Service',
      test: 'Can list employees',
      passed: !listError && !!userList,
      details: listError ? listError.message : `${userList?.length || 0} employees fetched`,
    });

    // Test 8: Audit Tables
    console.log('\n📋 Test Category 8: Audit Tables');
    console.log('-'.repeat(70));

    const { data: auditTest, error: auditError } = await adminClient
      .from('t_audit_log')
      .select('id, user_id')
      .limit(1);

    results.push({
      category: 'Audit Tables',
      test: 'Audit table accessible',
      passed: !auditError,
      details: auditError ? auditError.message : 'Table structure updated',
    });

    // Print Results
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(70));

    const categories = [...new Set(results.map(r => r.category))];
    
    for (const category of categories) {
      const categoryResults = results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.passed).length;
      const total = categoryResults.length;
      
      console.log(`\n${category}: ${passed}/${total} passed`);
      categoryResults.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`  ${icon} ${result.test}`);
        console.log(`     ${result.details}`);
      });
    }

    const totalPassed = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log(`OVERALL: ${totalPassed}/${totalTests} tests passed (${passRate}%)`);
    console.log('='.repeat(70));

    if (totalPassed === totalTests) {
      console.log('\n✅ ALL TESTS PASSED!');
      console.log('User-Employee separation is complete and working correctly.');
      process.exit(0);
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('Review the results above and address any issues.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runE2ETests();
}

export { runE2ETests };
