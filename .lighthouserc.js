module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000',
        'http://localhost:3000/explore', 
        'http://localhost:3000/login',
        'http://localhost:3000/connect-with-locals',
        'http://localhost:3000/messages'
      ],
      // Settings for collection
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop'
      },
      numberOfRuns: 3
    },
    assert: {
      // Performance budgets
      assertions: {
        // Core Web Vitals budgets for mid-range mobile
        'first-contentful-paint': ['error', { minScore: 0.8 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // LCP < 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // CLS < 0.1
        'total-blocking-time': ['error', { maxNumericValue: 200 }], // TBT < 200ms
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        
        // Resource size budgets
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }], // 50KB HTML
        'resource-summary:script:size': ['error', { maxNumericValue: 200000 }], // 200KB JS
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 30000 }], // 30KB CSS
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }], // 500KB images
        'resource-summary:total:size': ['error', { maxNumericValue: 1000000 }], // 1MB total
        
        // Performance metrics
        'uses-responsive-images': 'error',
        'uses-optimized-images': 'error',
        'modern-image-formats': 'error',
        'unused-css-rules': 'error',
        'unused-javascript': 'error',
        'uses-text-compression': 'error',
        'efficient-animated-content': 'error',
        'preload-lcp-image': 'error',
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'valid-lang': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr-value': 'error',
        'aria-valid-attr': 'error',
        'duplicate-id-aria': 'error',
        'heading-order': 'error',
        'landmark-one-main': 'error',
        'list': 'error',
        'listitem': 'error',
        'meta-viewport': 'error',
        'tabindex': 'error',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'http-status-code': 'error',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        'robots-txt': 'error',
        
        // Best practices
        'is-on-https': 'off', // Allow HTTP for local development
        'uses-http2': 'off', // Allow HTTP/1.1 for local development
        'external-anchors-use-rel-noopener': 'error',
        'geolocation-on-start': 'error',
        'doctype': 'error',
        'charset': 'error',
        'dom-size': ['error', { maxNumericValue: 1000 }],
        'no-document-write': 'error',
        'no-vulnerable-libraries': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};