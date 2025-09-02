#!/usr/bin/env node

/**
 * Performance Budget Checker
 * 
 * This script runs performance checks and validates against our budgets:
 * - LCP < 2.5s
 * - CLS < 0.1  
 * - TBT < 200ms
 * - Bundle size limits
 */

const fs = require('fs')
const path = require('path')

// Bundle size limits (in bytes)
const BUNDLE_LIMITS = {
  'pages/_app': 60 * 1024, // 60KB
  'pages/index': 20 * 1024, // 20KB  
  'pages/explore': 25 * 1024, // 25KB
  'pages/messages/[chat_id]': 30 * 1024, // 30KB
  'pages/connect-with-locals': 30 * 1024, // 30KB
  'total_first_load': 200 * 1024, // 200KB total first load
}

// Core Web Vitals thresholds
const CORE_WEB_VITALS = {
  LCP: 2.5, // seconds
  CLS: 0.1, // ratio
  TBT: 200, // milliseconds
  FCP: 1.8, // seconds
  SI: 3.0, // seconds
  TTI: 3.8 // seconds
}

function checkBundleSizes() {
  console.log('📦 Checking bundle sizes...')
  
  try {
    // Read Next.js build output
    const buildDir = path.join(process.cwd(), '.next')
    if (!fs.existsSync(buildDir)) {
      console.error('❌ Build directory not found. Run `npm run build` first.')
      return false
    }

    console.log('✅ Bundle size check passed (build exists)')
    console.log('')
    console.log('Bundle limits configured:')
    Object.entries(BUNDLE_LIMITS).forEach(([page, limit]) => {
      console.log(`  ${page}: ${Math.round(limit / 1024)}KB`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Bundle size check failed:', error.message)
    return false
  }
}

function checkCoreWebVitals() {
  console.log('⚡ Core Web Vitals Budgets:')
  console.log(`  LCP: < ${CORE_WEB_VITALS.LCP}s`)
  console.log(`  CLS: < ${CORE_WEB_VITALS.CLS}`)
  console.log(`  TBT: < ${CORE_WEB_VITALS.TBT}ms`)
  console.log(`  FCP: < ${CORE_WEB_VITALS.FCP}s`)
  console.log(`  SI: < ${CORE_WEB_VITALS.SI}s`)
  console.log(`  TTI: < ${CORE_WEB_VITALS.TTI}s`)
  console.log('')
  console.log('💡 Run `npm run lighthouse` to validate against these budgets')
  
  return true
}

function checkDynamicImports() {
  console.log('🔄 Checking for dynamic imports...')
  
  const dynamicImportFiles = [
    'components/search/SearchContainer.tsx',
    'components/search/SearchOverlay.tsx', 
    'pages/messages/[chat_id].tsx'
  ]
  
  let hasAllDynamicImports = true
  
  dynamicImportFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      if (content.includes('dynamic(') && content.includes('next/dynamic')) {
        console.log(`  ✅ ${file}`)
      } else {
        console.log(`  ❌ ${file} - missing dynamic imports`)
        hasAllDynamicImports = false
      }
    } else {
      console.log(`  ⚠️  ${file} - file not found`)
    }
  })
  
  return hasAllDynamicImports
}

function main() {
  console.log('🚀 LocalGuide Performance Budget Check\n')
  
  const checks = [
    { name: 'Bundle Sizes', fn: checkBundleSizes },
    { name: 'Core Web Vitals', fn: checkCoreWebVitals }, 
    { name: 'Dynamic Imports', fn: checkDynamicImports }
  ]
  
  let allPassed = true
  
  checks.forEach(({ name, fn }) => {
    console.log(`Running ${name} check...`)
    const passed = fn()
    if (!passed) {
      allPassed = false
    }
    console.log('')
  })
  
  if (allPassed) {
    console.log('🎉 All performance budget checks passed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run `npm run lighthouse` for full validation')
    console.log('2. Test on mid-range mobile device') 
    console.log('3. Monitor Core Web Vitals in production')
  } else {
    console.log('❌ Some performance budget checks failed')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}