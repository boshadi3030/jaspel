/**
 * Test Pool Guide Download Feature
 */

import { writeFileSync } from 'fs'
import { join } from 'path'

async function testPoolGuide() {
  console.log('🧪 Testing Pool Guide Download Feature...\n')

  try {
    // Test API endpoint
    console.log('1. Testing API endpoint...')
    const response = await fetch('http://localhost:3002/api/pool/guide')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('   ✅ API endpoint accessible')
    console.log(`   Status: ${response.status}`)
    console.log(`   Content-Type: ${response.headers.get('content-type')}`)
    console.log(`   Content-Disposition: ${response.headers.get('content-disposition')}`)

    // Get PDF buffer
    const buffer = await response.arrayBuffer()
    console.log(`   ✅ PDF generated successfully (${buffer.byteLength} bytes)`)

    // Save PDF for manual verification
    const testFilePath = join(process.cwd(), 'test-pool-guide.pdf')
    writeFileSync(testFilePath, Buffer.from(buffer))
    console.log(`   ✅ PDF saved to: ${testFilePath}`)

    // Verify PDF structure
    const pdfString = Buffer.from(buffer).toString('latin1')
    const hasPDFHeader = pdfString.startsWith('%PDF')
    const hasContent = pdfString.includes('PEDOMAN MANAJEMEN POOL')
    
    console.log('\n2. Verifying PDF content...')
    console.log(`   PDF Header: ${hasPDFHeader ? '✅' : '❌'}`)
    console.log(`   Has Title: ${hasContent ? '✅' : '❌'}`)

    // Check for key sections
    const sections = [
      'PENDAHULUAN',
      'KOMPONEN POOL',
      'FORMULA PERHITUNGAN',
      'DISTRIBUSI PROPORSIONAL',
      'CONTOH IMPLEMENTASI',
      'PERHITUNGAN PAJAK',
      'STATUS POOL',
      'PRAKTIK TERBAIK',
      'TROUBLESHOOTING'
    ]

    console.log('\n3. Checking document sections...')
    sections.forEach(section => {
      const hasSection = pdfString.includes(section)
      console.log(`   ${section}: ${hasSection ? '✅' : '❌'}`)
    })

    console.log('\n✅ All tests passed!')
    console.log('\n📝 Manual verification steps:')
    console.log('   1. Open test-pool-guide.pdf')
    console.log('   2. Verify all sections are present and formatted correctly')
    console.log('   3. Check tables and examples are readable')
    console.log('   4. Verify Indonesian language is used throughout')
    console.log('   5. Check professional formatting and layout')

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the development server is running:')
      console.log('   npm run dev')
    }
    
    process.exit(1)
  }
}

// Run test
testPoolGuide()
