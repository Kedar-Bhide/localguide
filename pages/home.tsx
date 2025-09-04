import Head from 'next/head'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Users, Globe, Star, ArrowRight, Sparkles } from 'lucide-react'
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

  const benefits = [
    {
      icon: Heart,
      title: "Authentic Experiences",
      description: "Discover hidden gems and local favorites that tourists never find",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: Users,
      title: "Vetted Local Experts",
      description: "Connect with carefully verified locals who know their cities inside out",
      color: "text-primary-600",
      bgColor: "bg-primary-50"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access local expertise in 50+ cities worldwide and growing",
      color: "text-secondary-600",
      bgColor: "bg-secondary-50"
    }
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Search Your Destination",
      description: "Enter where you're going and discover local experts waiting to help",
      image: "🔍"
    },
    {
      step: "02", 
      title: "Connect with Locals",
      description: "Browse profiles and message locals who match your interests and style",
      image: "💬"
    },
    {
      step: "03",
      title: "Experience Like a Local",
      description: "Get personalized recommendations and unique insider experiences",
      image: "✨"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      location: "Visited Tokyo",
      text: "My local guide showed me parts of Tokyo I never would have found. The best travel experience I've ever had!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      location: "Visited Barcelona",
      text: "Incredible insights into Barcelona's culture and food scene. Felt like I was traveling with a lifelong friend.",
      rating: 5
    },
    {
      name: "Elena Kovač",
      location: "Visited Prague",
      text: "The hidden spots and local stories made Prague come alive in ways no guidebook could capture.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Head>
        <title>LocalGuide - Experience Travel Like Never Before</title>
        <meta name="description" content="Connect with vetted local experts for authentic travel experiences. Discover hidden gems and experience destinations like a local." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader showAuthButtons={false} />
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-32 right-32 w-80 h-80 bg-secondary-400 rounded-full blur-3xl opacity-20 animate-float animate-delay-200"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-10 animate-float animate-delay-400"></div>
        </div>
        
        <div className="relative z-10 container-full text-center px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 animate-fade-up">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-700">Discover Authentic Travel</span>
              </div>
            </div>
            
            <h1 className="text-hero font-display text-neutral-900 mb-8 animate-fade-up animate-delay-100">
              Experience Travel
              <span className="block text-gradient">Like Never Before</span>
            </h1>
            
            <p className="text-subheading text-neutral-700 max-w-4xl mx-auto mb-12 animate-fade-up animate-delay-200">
              Connect with vetted local experts who reveal hidden gems, share authentic stories, and create unforgettable experiences tailored just for you
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-up animate-delay-300">
              <Link href={ROUTES.JOIN}>
                <Button variant="primary" size="xl" className="shadow-2xl hover:shadow-glow group">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button variant="secondary" size="xl" className="bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-12 text-neutral-600 animate-fade-up animate-delay-400">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold">4.9/5 rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary-600" />
                <span className="font-semibold">10,000+ travelers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-secondary-600" />
                <span className="font-semibold">50+ cities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Section */}
      <div className="relative -mt-32 z-20 container-full px-6">
        <Card 
          variant="glass"
          shadow="2xl"
          className="max-w-6xl mx-auto border border-white/20"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">Where will your story begin?</h2>
            <p className="text-lg text-neutral-600">Find the perfect local guide for your next adventure</p>
          </div>
          <SearchContainer isHomePage={true} />
        </Card>
      </div>

      {/* Benefits Section */}
      <section className="section-lg">
        <div className="container-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-headline font-display text-neutral-900 mb-6">
              Why Choose LocalGuide?
            </h2>
            <p className="text-subheading text-neutral-600 max-w-3xl mx-auto">
              Join thousands of travelers who've discovered the magic of authentic local experiences
            </p>
          </div>

          <div className="grid-3 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card 
                key={index}
                variant="hover"
                className={`text-center group animate-fade-up animate-delay-${(index + 1) * 100}`}
              >
                <div className={`w-16 h-16 ${benefit.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">{benefit.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-lg bg-neutral-50">
        <div className="container-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-headline font-display text-neutral-900 mb-6">
              Three Simple Steps to Amazing
            </h2>
            <p className="text-subheading text-neutral-600 max-w-3xl mx-auto">
              Getting started is easy. Here's how to unlock authentic travel experiences
            </p>
          </div>

          <div className="grid-3 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <Card 
                key={index}
                className={`text-center relative overflow-hidden animate-fade-up animate-delay-${(index + 1) * 100}`}
              >
                <div className="text-6xl mb-6">{step.image}</div>
                <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{step.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">{step.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-lg">
        <div className="container-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-headline font-display text-neutral-900 mb-6">
              Stories From Our Travelers
            </h2>
            <p className="text-subheading text-neutral-600 max-w-3xl mx-auto">
              Real experiences from real travelers who discovered the world through local eyes
            </p>
          </div>

          <div className="grid-3 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                variant="hover"
                className={`animate-fade-up animate-delay-${(index + 1) * 100}`}
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-700 leading-relaxed mb-6 text-lg italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-neutral-100 pt-4">
                  <p className="font-bold text-neutral-900">{testimonial.name}</p>
                  <p className="text-neutral-500 text-sm">{testimonial.location}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-lg bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container-full px-6 text-center">
          <h2 className="text-headline font-display mb-6">
            Ready to Experience Travel Differently?
          </h2>
          <p className="text-subheading text-white/90 max-w-3xl mx-auto mb-12">
            Join thousands of travelers who've discovered authentic experiences with LocalGuide
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={ROUTES.JOIN}>
              <Button variant="secondary" size="xl" className="bg-white text-primary-600 hover:bg-white/90 shadow-2xl">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="xl" 
              onClick={copyToClipboard}
              className="text-white border-2 border-white/30 hover:bg-white/10"
            >
              {copied ? '✓ Link Copied!' : 'Share LocalGuide'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}