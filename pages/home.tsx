import Head from 'next/head'
import { useState } from 'react'
import Link from 'next/link'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { ROUTES } from '../utils/constants'

export default function Home() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    const currentUrl = `${window.location.origin}/home`
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>LocalGuide - Connect with Local Experts</title>
        <meta name="description" content="Connect travelers with vetted locals for personalized trip experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header showAuthButtons={true} />

      <main className="h-screen overflow-hidden flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Section: How it Works + Search Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Card: How it Works */}
            <Card className="h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traveler Column */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Traveler</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                      <span>Search and connect with vetted locals in your destination</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                      <span>Get personalized recommendations and insider tips</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                      <span>Book unique experiences with local guides</span>
                    </li>
                  </ul>
                </div>

                {/* Local Column */}
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-4">Local</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span>Share your local expertise and earn income</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span>Connect with travelers seeking authentic experiences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span>Build your reputation as a trusted guide</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Right Card: Search Placeholder */}
            <Card className="h-full flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Box Coming Soon</h3>
                <p className="text-gray-600 mb-4">Find locals in your destination</p>
                <div className="w-full max-w-md">
                  <input 
                    type="text" 
                    placeholder="Where are you traveling?" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Section: CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Traveler CTA Card */}
            <Card className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">I'm a Traveler</h3>
              <p className="text-gray-600 mb-4">Planning a trip and looking for local insights</p>
              <Link href={ROUTES.TRAVELER_SIGNUP}>
                <Button variant="primary" className="w-full mb-2">
                  How →
                </Button>
              </Link>
            </Card>

            {/* Local CTA Card */}
            <Card className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">I'm a Local</h3>
              <p className="text-gray-600 mb-4">I know my city and want to help travelers</p>
              <Link href={ROUTES.LOCAL_SIGNUP}>
                <Button variant="primary" className="w-full mb-2">
                  How →
                </Button>
              </Link>
            </Card>

            {/* Spread the Word Card */}
            <Card className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Spread the word</h3>
              <p className="text-gray-600 mb-4">Help others discover authentic travel experiences</p>
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="w-full"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}