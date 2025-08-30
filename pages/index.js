import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>LocalGuide - Connect with Local Experts</title>
        <meta name="description" content="Connect travelers with vetted locals for personalized trip experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#333' }}>
          🌍 LocalGuide
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Connect travelers with vetted locals for personalized trip experiences
        </p>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f0f8ff', 
          borderRadius: '8px', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          <p style={{ margin: 0, color: '#0066cc' }}>
            🚀 MVP in development - Coming soon!
          </p>
        </div>
      </main>
    </div>
  )
}