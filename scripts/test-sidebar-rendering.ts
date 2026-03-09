import { getMenuItemsForRole } from '../lib/services/rbac.service'

console.log('Testing Sidebar Menu Items...\n')

// Test for each role
const roles = ['superadmin', 'unit_manager', 'employee'] as const

roles.forEach(role => {
  console.log(`\n=== ${role.toUpperCase()} ===`)
  const menuItems = getMenuItemsForRole(role)
  
  if (menuItems.length === 0) {
    console.log('❌ No menu items found!')
  } else {
    console.log(`✅ Found ${menuItems.length} menu items:`)
    menuItems.forEach(item => {
      console.log(`  - ${item.label} (${item.path}) [${item.icon}]`)
    })
  }
})

console.log('\n✅ Test completed!')
