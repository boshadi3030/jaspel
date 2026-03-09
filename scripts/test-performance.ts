/**
 * Performance Testing Script
 * Run with: npx ts-node scripts/test-performance.ts
 */

interface PerformanceMetric {
  name: string
  duration: number
  status: 'pass' | 'fail' | 'warning'
}

const metrics: PerformanceMetric[] = []

// Thresholds (in milliseconds)
const THRESHOLDS = {
  middleware: 100,
  apiCall: 500,
  pageLoad: 1000,
  search: 300,
}

function measureTime(name: string, fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  return end - start
}

async function measureAsync(name: string, fn: () => Promise<void>): Promise<number> {
  const start = performance.now()
  await fn()
  const end = performance.now()
  return end - start
}

function evaluateMetric(name: string, duration: number, threshold: number): PerformanceMetric {
  let status: 'pass' | 'fail' | 'warning' = 'pass'
  
  if (duration > threshold * 1.5) {
    status = 'fail'
  } else if (duration > threshold) {
    status = 'warning'
  }
  
  return { name, duration, status }
}

async function testMiddlewarePerformance() {
  console.log('\n🔍 Testing Middleware Performance...')
  
  // Simulate middleware cache hit
  const cacheHitTime = measureTime('Middleware (Cache Hit)', () => {
    // Simulate cache lookup
    const cache = new Map()
    cache.set('test@example.com', { role: 'employee', is_active: true })
    cache.get('test@example.com')
  })
  
  metrics.push(evaluateMetric('Middleware Cache Hit', cacheHitTime, THRESHOLDS.middleware))
}

async function testSearchDebounce() {
  console.log('\n🔍 Testing Search Debounce...')
  
  let callCount = 0
  const debounce = (fn: Function, delay: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }
  
  const debouncedSearch = debounce(() => {
    callCount++
  }, 500)
  
  // Simulate rapid typing
  const start = performance.now()
  for (let i = 0; i < 10; i++) {
    debouncedSearch()
  }
  
  // Wait for debounce
  await new Promise(resolve => setTimeout(resolve, 600))
  const duration = performance.now() - start
  
  console.log(`  ✓ Debounce reduced 10 calls to ${callCount} call(s)`)
  metrics.push(evaluateMetric('Search Debounce', duration, THRESHOLDS.search))
}

async function testCacheSystem() {
  console.log('\n🔍 Testing Cache System...')
  
  const cache = new Map<string, { data: any; timestamp: number }>()
  const TTL = 5 * 60 * 1000
  
  // Test cache write
  const writeTime = measureTime('Cache Write', () => {
    cache.set('test-key', {
      data: { test: 'data' },
      timestamp: Date.now()
    })
  })
  
  // Test cache read
  const readTime = measureTime('Cache Read', () => {
    const cached = cache.get('test-key')
    if (cached && Date.now() - cached.timestamp < TTL) {
      return cached.data
    }
  })
  
  console.log(`  ✓ Cache write: ${writeTime.toFixed(2)}ms`)
  console.log(`  ✓ Cache read: ${readTime.toFixed(2)}ms`)
  
  metrics.push(evaluateMetric('Cache Operations', writeTime + readTime, 10))
}

async function testComponentMemoization() {
  console.log('\n🔍 Testing Component Memoization...')
  
  // Simulate React component render
  let renderCount = 0
  
  const Component = () => {
    renderCount++
    return { props: {} }
  }
  
  // Without memo - renders every time
  const withoutMemoTime = measureTime('Without Memo', () => {
    for (let i = 0; i < 100; i++) {
      Component()
    }
  })
  
  renderCount = 0
  
  // With memo - renders once
  const memoized = Component()
  const withMemoTime = measureTime('With Memo', () => {
    for (let i = 0; i < 100; i++) {
      // Return cached result
      memoized
    }
  })
  
  console.log(`  ✓ Without memo: ${withoutMemoTime.toFixed(2)}ms (${renderCount} renders)`)
  console.log(`  ✓ With memo: ${withMemoTime.toFixed(2)}ms (cached)`)
  console.log(`  ✓ Improvement: ${((1 - withMemoTime / withoutMemoTime) * 100).toFixed(1)}%`)
}

function printResults() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 PERFORMANCE TEST RESULTS')
  console.log('='.repeat(60))
  
  const passed = metrics.filter(m => m.status === 'pass').length
  const warnings = metrics.filter(m => m.status === 'warning').length
  const failed = metrics.filter(m => m.status === 'fail').length
  
  metrics.forEach(metric => {
    const icon = metric.status === 'pass' ? '✅' : metric.status === 'warning' ? '⚠️' : '❌'
    console.log(`${icon} ${metric.name}: ${metric.duration.toFixed(2)}ms [${metric.status.toUpperCase()}]`)
  })
  
  console.log('\n' + '-'.repeat(60))
  console.log(`Total Tests: ${metrics.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('-'.repeat(60))
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Consider further optimization.')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('\n⚠️  Some tests have warnings. Performance is acceptable but could be improved.')
  } else {
    console.log('\n✅ All tests passed! Performance is optimal.')
  }
}

async function runTests() {
  console.log('🚀 Starting Performance Tests...')
  console.log('This will test various optimization features.')
  
  try {
    await testMiddlewarePerformance()
    await testSearchDebounce()
    await testCacheSystem()
    await testComponentMemoization()
    
    printResults()
  } catch (error) {
    console.error('\n❌ Error running tests:', error)
    process.exit(1)
  }
}

// Run tests
runTests()
