'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Users, 
  MessageCircle, 
  Star, 
  Globe, 
  Heart,
  ArrowRight,
  Play,
  Shield,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth'

const features = [
  {
    icon: MapPin,
    title: 'Discover Local Gems',
    description: 'Find hidden treasures and authentic experiences that only locals know about.',
    color: 'text-primary-500'
  },
  {
    icon: Users,
    title: 'Connect with Experts',
    description: 'Chat with verified local experts who are passionate about sharing their city.',
    color: 'text-secondary-500'
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    description: 'Get instant recommendations and build meaningful connections.',
    color: 'text-accent-500'
  },
  {
    icon: Shield,
    title: 'Verified Locals',
    description: 'All local experts are verified to ensure authentic and safe experiences.',
    color: 'text-success-500'
  }
]

const stats = [
  { label: 'Local Experts', value: '10K+', icon: Users },
  { label: 'Cities Covered', value: '500+', icon: Globe },
  { label: 'Happy Travelers', value: '50K+', icon: Heart },
  { label: 'Connections Made', value: '100K+', icon: MessageCircle }
]

export default function HomePage() {
  const { user, profile, initialize, initialized } = useAuthStore()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    initialize()
    setIsVisible(true)
  }, [initialize])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Welcome back, {profile?.full_name || user.email}!
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Ready to discover new places or help fellow travelers?
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Locals
                </Button>
              </Link>
              <Link href="/chats">
                <Button variant="outline" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  My Chats
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-semibold text-gradient">
                LocalGuide
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-display font-bold text-balance mb-6">
              Travel Like a{' '}
              <span className="text-gradient">Local</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 text-balance mb-8 leading-relaxed">
              Connect with verified local experts worldwide. Discover authentic experiences, 
              hidden gems, and create meaningful connections while you explore.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link href="/auth/signup">
                <Button size="xl" className="group">
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button variant="outline" size="xl" className="group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-4xl">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-2xl p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                        className="text-center"
                      >
                        <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary-600" />
                        <div className="text-2xl font-bold text-neutral-900 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
              Why Choose LocalGuide?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Experience travel like never before with our unique platform connecting 
              you to authentic local experiences.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover p-8 text-center group"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-100 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Ready to Explore?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Join LocalGuide today and start connecting with amazing local experts 
              around the world. Your next adventure awaits!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button 
                  size="xl" 
                  variant="outline" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Join as Traveler
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/auth/signup">
                <Button 
                  size="xl" 
                  className="bg-white text-primary-700 hover:bg-white/90"
                >
                  Become a Local Expert
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900 text-neutral-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-semibold text-white">
                LocalGuide
              </span>
            </Link>
            <p className="text-neutral-400 max-w-md mx-auto mb-6">
              Connecting travelers with local experts for authentic experiences worldwide.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-neutral-800 text-sm text-neutral-500">
              © 2024 LocalGuide. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}