/**
 * User-Employee Migration Script
 * Migrates existing m_employees records to Supabase Auth
 * 
 * This script:
 * 1. Fetches all employees from m_employees
 * 2. Creates auth.users records for each employee
 * 3. Links employees to auth users via user_id
 * 4. Logs all operations for audit
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  role: 'superadmin' | 'unit_manager' | 'employee';
  unit_id: string;
  is_active: boolean;
}

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: Array<{ employeeId: string; email: string; error: string }>;
}

interface MigrationLog {
  employeeId: string;
  email: string;
  status: 'success' | 'skipped' | 'error';
  authUserId?: string;
  tempPassword?: string;
  error?: string;
  timestamp: string;
}

/**
 * Generate temporary password in format: JASPEL-YYYYMMDD-XXXX
 */
function generateTempPassword(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JASPEL-${date}-${random}`;
}

/**
 * Main migration function
 */
async function migrateEmployeesToAuth(): Promise<MigrationResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create admin client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  const logs: MigrationLog[] = [];

  console.log('🚀 Starting user migration...\n');

  try {
    // Step 1: Fetch all employees
    console.log('📋 Fetching employees from m_employees...');
    const { data: employees, error: fetchError } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, email, role, unit_id, is_active, user_id')
      .order('created_at');

    if (fetchError) {
      throw new Error(`Failed to fetch employees: ${fetchError.message}`);
    }

    if (!employees || employees.length === 0) {
      console.log('⚠️  No employees found to migrate');
      return result;
    }

    console.log(`✅ Found ${employees.length} employees\n`);

    // Step 2: Migrate each employee
    for (const employee of employees) {
      const log: MigrationLog = {
        employeeId: employee.id,
        email: employee.email,
        status: 'error',
        timestamp: new Date().toISOString(),
      };

      try {
        // Skip if already migrated
        if (employee.user_id) {
          console.log(`⏭️  Skipping ${employee.email} - already migrated`);
          log.status = 'skipped';
          log.authUserId = employee.user_id;
          logs.push(log);
          result.skippedCount++;
          continue;
        }

        console.log(`🔄 Migrating ${employee.email}...`);

        // Generate temporary password
        const tempPassword = generateTempPassword();
        log.tempPassword = tempPassword;

        // Create auth.users record
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: employee.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            role: employee.role,
            full_name: employee.full_name,
            employee_id: employee.id,
            unit_id: employee.unit_id,
          },
        });

        if (createError) {
          // Check if user already exists in auth
          if (createError.message.includes('already registered') || 
              createError.message.includes('already been registered') ||
              createError.status === 422) {
            console.log(`⚠️  User ${employee.email} already exists in auth.users`);
            
            // Try to find existing auth user
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers?.users.find(u => u.email === employee.email);
            
            if (existingUser) {
              // Update user metadata if missing
              if (!existingUser.user_metadata?.role || !existingUser.user_metadata?.employee_id) {
                await supabase.auth.admin.updateUserById(existingUser.id, {
                  user_metadata: {
                    role: employee.role,
                    full_name: employee.full_name,
                    employee_id: employee.id,
                    unit_id: employee.unit_id,
                  },
                });
                console.log(`   Updated user metadata`);
              }

              // Link existing auth user to employee
              const { error: updateError } = await supabase
                .from('m_employees')
                .update({ user_id: existingUser.id })
                .eq('id', employee.id);

              if (updateError) {
                throw new Error(`Failed to link existing user: ${updateError.message}`);
              }

              console.log(`✅ Linked existing auth user to employee`);
              log.status = 'success';
              log.authUserId = existingUser.id;
              logs.push(log);
              result.migratedCount++;
              continue;
            } else {
              throw new Error('User exists in auth but could not be found');
            }
          }
          
          throw createError;
        }

        if (!authUser.user) {
          throw new Error('Auth user creation returned no user');
        }

        log.authUserId = authUser.user.id;

        // Update m_employees with user_id
        const { error: updateError } = await supabase
          .from('m_employees')
          .update({ user_id: authUser.user.id })
          .eq('id', employee.id);

        if (updateError) {
          // Rollback: delete auth user if employee update fails
          await supabase.auth.admin.deleteUser(authUser.user.id);
          throw new Error(`Failed to update employee: ${updateError.message}`);
        }

        console.log(`✅ Migrated ${employee.email} successfully`);
        console.log(`   Auth User ID: ${authUser.user.id}`);
        console.log(`   Temp Password: ${tempPassword}\n`);

        log.status = 'success';
        logs.push(log);
        result.migratedCount++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to migrate ${employee.email}: ${errorMessage}\n`);
        
        log.status = 'error';
        log.error = errorMessage;
        logs.push(log);
        
        result.errors.push({
          employeeId: employee.id,
          email: employee.email,
          error: errorMessage,
        });
        result.success = false;
      }
    }

    // Step 3: Save migration log
    console.log('\n📝 Saving migration log...');
    const logFileName = `migration-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const fs = await import('fs');
    fs.writeFileSync(logFileName, JSON.stringify(logs, null, 2));
    console.log(`✅ Migration log saved to ${logFileName}\n`);

    // Step 4: Print summary
    console.log('=' .repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Employees: ${employees.length}`);
    console.log(`Successfully Migrated: ${result.migratedCount}`);
    console.log(`Skipped (Already Migrated): ${result.skippedCount}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log('='.repeat(60));

    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.errors.forEach(err => {
        console.log(`  - ${err.email}: ${err.error}`);
      });
    }

    if (result.migratedCount > 0) {
      console.log('\n⚠️  IMPORTANT: Save the temporary passwords from the log file!');
      console.log('   Users will need to reset their passwords on first login.');
    }

  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    result.success = false;
    throw error;
  }

  return result;
}

// Run migration
if (require.main === module) {
  migrateEmployeesToAuth()
    .then(result => {
      if (result.success && result.errors.length === 0) {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Migration completed with errors');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateEmployeesToAuth, generateTempPassword };
