# Quick test database connection and employee data
Write-Host "Testing database connection..." -ForegroundColor Cyan

$env:NODE_ENV = "development"

$testScript = @"
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function quickTest() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Testing employee query...');
  const start = Date.now();
  
  const { data, error } = await supabase
    .from('m_employees')
    .select('id, user_id, full_name, is_active')
    .limit(5);
  
  const duration = Date.now() - start;
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Duration:', duration + 'ms');
    console.log('Found', data.length, 'employees');
    data.forEach(emp => {
      console.log('-', emp.full_name, '(Active:', emp.is_active + ')');
    });
  }
}

quickTest().catch(console.error);
"@

$testScript | node

Write-Host "`nTest completed!" -ForegroundColor Green
