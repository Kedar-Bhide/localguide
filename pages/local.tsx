import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { signUpUser } from '../utils/auth'
import { validateEmail, validatePassword, validateName } from '../utils/validation'
import { ROUTES } from '../utils/constants'

export default function LocalSignup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])
    setMessage('')

    const newErrors: string[] = []

    if (!validateName(formData.fullName)) {
      newErrors.push('Full name must be at least 2 characters')
    }

    if (!validateEmail(formData.email)) {
      newErrors.push('Please enter a valid email address')
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.push(...passwordValidation.errors)
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      await signUpUser(formData.email, formData.password, formData.fullName)
      setMessage('Check your email to confirm your account, then you can log in!')
    } catch (error: any) {
      console.error('Signup error:', error)
      if (error.message?.includes('already registered')) {
        setErrors(['This email is already registered. Please try logging in instead.'])
      } else {
        setErrors([error.message || 'Failed to create account. Please try again.'])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-neutral-50">
      <Head>
        <title>Join as Local Expert - LocalGuide</title>
        <meta name="description" content="Share your local expertise and earn income helping travelers discover your city" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="relative py-16 lg:py-24">
          <div className="container-narrow">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight animate-fade-in">
                Share Your City,
                <span className="block text-secondary-500">Earn Income</span>
              </h1>
              <p className="text-xl lg:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed animate-slide-up">
                Join thousands of local experts helping travelers discover authentic experiences in your city
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center animate-fade-slide">
                <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Flexible Income</h3>
                <p className="text-neutral-600">Set your own rates and work on your schedule</p>
              </div>

              <div className="text-center animate-fade-slide">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Meet People</h3>
                <p className="text-neutral-600">Connect with travelers from around the world</p>
              </div>

              <div className="text-center animate-fade-slide">
                <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Share Passion</h3>
                <p className="text-neutral-600">Show others what makes your city special</p>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* How it works */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-6">How it works for locals</h2>
                  <p className="text-lg text-neutral-600 mb-8">
                    Simple steps to start earning by sharing your local knowledge
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <span className="text-secondary-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-2">Create your profile</h4>
                      <p className="text-neutral-600">Showcase your local expertise and unique knowledge of your city</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <span className="text-secondary-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-2">Connect with travelers</h4>
                      <p className="text-neutral-600">Help visitors discover the authentic side of your city through messages</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <span className="text-secondary-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-2">Build your reputation</h4>
                      <p className="text-neutral-600">Generate income while building your reputation as a trusted local guide</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-100">
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-secondary-700">
                    The most successful local experts share personal stories and hidden gems that tourists never discover on their own.
                  </p>
                </div>
              </div>

              {/* Signup Form */}
              <Card className="p-8 shadow-xl border-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Create your account</h3>
                  <p className="text-neutral-600">Join the LocalGuide community today</p>
                </div>

                {message && (
                  <div className="mb-6 p-4 bg-secondary-50 border border-secondary-200 text-secondary-800 rounded-xl">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-secondary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {message}
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        {errors.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-neutral-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors text-neutral-900 placeholder-neutral-500"
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors text-neutral-900 placeholder-neutral-500"
                      placeholder="Enter your email address"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors text-neutral-900 placeholder-neutral-500"
                      placeholder="Create a secure password"
                      required
                      disabled={loading}
                    />
                    <p className="mt-2 text-sm text-neutral-500">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    loading={loading}
                    variant="primary"
                    className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    Create Local Expert Account
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
                  <p className="text-neutral-600">
                    Already have an account?{' '}
                    <Link 
                      href={ROUTES.LOGIN}
                      className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-neutral-500">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-secondary-600 hover:text-secondary-700 transition-colors">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-secondary-600 hover:text-secondary-700 transition-colors">Privacy Policy</a>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="section-spacing bg-neutral-50 border-t">
          <div className="container-grid">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Join successful local experts
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Local experts on LocalGuide earn income while sharing their passion for their city
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600 mb-2">500+</div>
                <p className="text-neutral-600">Local Experts</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                <p className="text-neutral-600">Cities Worldwide</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-2">4.8★</div>
                <p className="text-neutral-600">Average Rating</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-neutral-600 mb-4">Want to learn more about becoming a local expert?</p>
              <Link href={ROUTES.BECOME_A_LOCAL}>
                <Button variant="secondary" className="px-8 py-3">
                  View Complete Guide →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}