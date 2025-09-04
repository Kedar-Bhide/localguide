import Head from 'next/head'
import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '../components/layout/AppHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SearchContainer from '../components/search/SearchContainer'
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
    <div className="min-h-screen bg-white">
      <Head>
        <title>LocalGuide - Connect with Local Experts</title>
        <meta name="description" content="Connect travelers with vetted locals for personalized trip experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader showAuthButtons={false} />
      
      {/* Hero Section with Background */}
      <div className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-32 w-96 h-96 bg-secondary-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container-grid text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-8 leading-tight animate-fade-in">
              Discover
              <span className="block text-primary-500">
                Authentic Travel
              </span>
              <span className="text-4xl lg:text-6xl text-neutral-700">
                with Local Experts
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Connect with vetted locals who know their cities inside out and discover experiences you won't find in guidebooks
            </p>

            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
              <Link href={ROUTES.LOGIN}>
                <Button variant="secondary" size="lg" className="min-w-[140px] text-lg">
                  Sign In
                </Button>
              </Link>
              <Link href={ROUTES.JOIN}>
                <Button variant="primary" size="lg" className="min-w-[140px] text-lg shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <div className="relative -mt-20 z-20">
        <div className="container-grid">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-5xl mx-auto border">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Where are you going?</h2>
              <p className="text-neutral-600">Find your perfect local guide</p>
            </div>
            <SearchContainer isHomePage={true} />
          </div>
        </div>
      </div>

      {/* Primary CTA Section */}
      <div className="section-spacing-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container-grid text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready for your next adventure?
          </h2>
          <p className="text-xl lg:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
            Browse destinations and connect with local experts who will show you their city like never before
          </p>
          <Link href={ROUTES.EXPLORE}>
            <Button variant="secondary" size="lg" className="px-12 py-4 text-xl font-semibold bg-white text-primary-600 hover:bg-neutral-50 border-0 shadow-lg">
              Explore Destinations →
            </Button>
          </Link>
        </div>
      </div>

      {/* How It Works - Visual Cards */}
      <div className="section-spacing-lg">
        <div className="container-grid">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">How LocalGuide works</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Simple steps to authentic travel experiences with local experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Travelers Section */}
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold text-neutral-900 mb-4">For Travelers</h3>
                <p className="text-lg text-neutral-600 mb-8">
                  Connect with vetted locals and discover authentic experiences
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">Search destinations</h4>
                    <p className="text-neutral-600">Find and browse local experts in your destination city</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">Connect with locals</h4>
                    <p className="text-neutral-600">Message locals who match your interests and travel style</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">Experience like a local</h4>
                    <p className="text-neutral-600">Get personalized recommendations and unique insider experiences</p>
                  </div>
                </div>
              </div>

              <Link href={ROUTES.TRAVELER_SIGNUP}>
                <Button variant="primary" className="w-full md:w-auto px-8 py-3 text-lg">
                  Start as Traveler →
                </Button>
              </Link>
            </div>

            {/* Locals Section */}
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold text-neutral-900 mb-4">For Locals</h3>
                <p className="text-lg text-neutral-600 mb-8">
                  Share your expertise and earn income helping travelers
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center">
                    <span className="text-secondary-600 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">Create your profile</h4>
                    <p className="text-neutral-600">Showcase your local expertise and unique knowledge</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center">
                    <span className="text-secondary-600 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">Connect with travelers</h4>
                    <p className="text-neutral-600">Help visitors discover the authentic side of your city</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center">
                    <span className="text-secondary-600 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">Earn and build reputation</h4>
                    <p className="text-neutral-600">Generate income while building your reputation as a trusted guide</p>
                  </div>
                </div>
              </div>

              <Link href={ROUTES.LOCAL_SIGNUP}>
                <Button variant="secondary" className="w-full md:w-auto px-8 py-3 text-lg border-2 border-secondary-500 text-secondary-600 hover:bg-secondary-50">
                  Become a Local →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Safety Section */}
      <div className="section-spacing-lg bg-neutral-50">
        <div className="container-grid">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">Why travelers trust LocalGuide</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Safety, authenticity, and quality experiences are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Vetted Locals</h3>
              <p className="text-neutral-600 leading-relaxed">
                All our local guides are carefully verified and reviewed to ensure quality experiences
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Authentic Experiences</h3>
              <p className="text-neutral-600 leading-relaxed">
                Discover hidden gems and local favorites that you won't find in traditional guidebooks
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Community Driven</h3>
              <p className="text-neutral-600 leading-relaxed">
                Join a community of travelers and locals creating meaningful connections worldwide
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="section-spacing bg-white border-t">
        <div className="container-grid text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Love LocalGuide?</h2>
          <p className="text-neutral-600 mb-8">Help others discover authentic travel experiences</p>
          <Button 
            onClick={copyToClipboard}
            variant="secondary"
            className="px-8 py-3"
            disabled={copied}
          >
            {copied ? '✓ Link Copied!' : 'Share LocalGuide'}
          </Button>
        </div>
      </div>
    </div>
  )
}