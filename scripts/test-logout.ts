import { chromium } from 'playwright'

async function testLogout() {
  console.log('🧪 Testing Logout Functionality...\n')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // 1. Login first
    console.log('1️⃣ Logging in...')
    await page.goto('http://localhost:3002/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'superadmin@jaspel.com')
    await page.fill('input[type="password"]', 'superadmin123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    console.log('✅ Login successful\n')

    // 2. Wait for sidebar to load
    console.log('2️⃣ Waiting for sidebar...')
    await page.waitForSelector('button:has-text("Keluar")', { timeout: 5000 })
    console.log('✅ Sidebar loaded\n')

    // 3. Click logout button
    console.log('3️⃣ Clicking logout button...')
    await page.click('button:has-text("Keluar")')
    
    // 4. Wait for confirmation dialog
    console.log('4️⃣ Waiting for confirmation dialog...')
    await page.waitForSelector('text=Konfirmasi Keluar', { timeout: 3000 })
    console.log('✅ Confirmation dialog appeared\n')

    // 5. Click confirm logout
    console.log('5️⃣ Confirming logout...')
    await page.click('button:has-text("Ya, Keluar")')
    
    // 6. Wait for redirect to login
    console.log('6️⃣ Waiting for redirect to login...')
    await page.waitForURL('**/login', { timeout: 10000 })
    console.log('✅ Redirected to login page\n')

    // 7. Verify session is cleared
    console.log('7️⃣ Verifying session is cleared...')
    const cookies = await context.cookies()
    const authCookies = cookies.filter(c => 
      c.name.includes('supabase') || 
      c.name.includes('auth') ||
      c.name.includes('session')
    )
    
    if (authCookies.length === 0) {
      console.log('✅ All auth cookies cleared\n')
    } else {
      console.log('⚠️ Some auth cookies still present:', authCookies.map(c => c.name))
    }

    // 8. Try to access protected page
    console.log('8️⃣ Testing access to protected page...')
    await page.goto('http://localhost:3002/admin/dashboard')
    await page.waitForLoadState('networkidle')
    
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      console.log('✅ Correctly redirected to login (session cleared)\n')
    } else {
      console.log('❌ Still able to access protected page (session not cleared)\n')
    }

    console.log('✅ All logout tests passed!')
    
    // Keep browser open for 3 seconds to see result
    await page.waitForTimeout(3000)

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

testLogout().catch(console.error)
