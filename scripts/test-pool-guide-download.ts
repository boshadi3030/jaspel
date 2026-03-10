import fetch from 'node-fetch'

async function testGuideDownload() {
  console.log('🧪 Testing Pool Guide Download API...\n')

  try {
    const response = await fetch('http://localhost:3002/api/kpi-config/guide')
    
    console.log('Status:', response.status)
    console.log('Content-Type:', response.headers.get('content-type'))
    console.log('Content-Disposition:', response.headers.get('content-disposition'))
    
    if (response.ok) {
      const buffer = await response.buffer()
      console.log('PDF Size:', buffer.length, 'bytes')
      console.log('\n✅ API berfungsi dengan baik!')
    } else {
      const error = await response.text()
      console.error('❌ Error:', error)
    }
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

testGuideDownload()
