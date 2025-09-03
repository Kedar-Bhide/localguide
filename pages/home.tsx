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
    <div className="min-h-screen bg-[color:var(--bg-soft)]">
      <Head>
        <title>LocalGuide - Connect with Local Experts</title>
        <meta name="description" content="Connect travelers with vetted locals for personalized trip experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader showAuthButtons={true} />
      
      {/* Hero Section */}
      <div className="relative section-spacing">
        <div className="max-w-4xl mx-auto text-center section-gutter">
          <h1 className="headline-large animate-fade-in">
            Connect with Local Experts
          </h1>
          <p className="body-large text-secondary-color mb-12 max-w-2xl mx-auto animate-slide-up">
            Discover authentic experiences with vetted locals who know their cities inside out
          </p>
        </div>
        
        {/* Search Container - expanded by default, collapses on scroll */}
        <SearchContainer isHomePage={true} />
      </div>

      <main className="section-spacing">
        <div className="max-w-7xl mx-auto section-gutter">
          {/* How it Works Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="headline">How it works</h2>
              <p className="body-large text-secondary-color">Simple steps to authentic travel experiences</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Traveler Column */}
              <div className="card p-8">
                <h3 className="subheading text-brand-color">For Travelers</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-3 h-3 bg-[color:var(--brand)] rounded-full mt-2 mr-4"></span>
                    <span className="body">Search and connect with vetted locals in your destination</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-3 h-3 bg-[color:var(--brand)] rounded-full mt-2 mr-4"></span>
                    <span className="body">Get personalized recommendations and insider tips</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-3 h-3 bg-[color:var(--brand)] rounded-full mt-2 mr-4"></span>
                    <span className="body">Book unique experiences with local guides</span>
                  </li>
                </ul>
              </div>

              {/* Local Column */}
              <div className="card p-8">
                <h3 className="subheading" style={{color: 'var(--success)'}}>For Locals</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-3 h-3 bg-[color:var(--success)] rounded-full mt-2 mr-4"></span>
                    <span className="body">Share your local expertise and earn income</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-3 h-3 bg-[color:var(--success)] rounded-full mt-2 mr-4"></span>
                    <span className="body">Connect with travelers seeking authentic experiences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-3 h-3 bg-[color:var(--success)] rounded-full mt-2 mr-4"></span>
                    <span className="body">Build your reputation as a trusted guide</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Traveler CTA Card */}
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[color:var(--brand)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[color:var(--brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="subheading">I&apos;m a Traveler</h3>
              <p className="body text-secondary-color">Planning a trip and looking for local insights</p>
              <Link href={ROUTES.TRAVELER_SIGNUP}>
                <Button className="w-full">
                  Get Started →
                </Button>
              </Link>
            </div>

            {/* Local CTA Card */}
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[color:var(--success)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[color:var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="subheading">I&apos;m a Local</h3>
              <p className="body text-secondary-color">I know my city and want to help travelers</p>
              <Link href={ROUTES.LOCAL_SIGNUP}>
                <Button className="w-full">
                  Start Earning →
                </Button>
              </Link>
            </div>

            {/* Spread the Word Card */}
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[color:var(--warning)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[color:var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="subheading">Spread the Word</h3>
              <p className="body text-secondary-color">Help others discover authentic travel experiences</p>
              <Button 
                onClick={copyToClipboard}
                className="w-full"
                variant="secondary"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}