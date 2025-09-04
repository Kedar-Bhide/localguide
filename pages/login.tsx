import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Globe, Heart, Users } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { signInUser } from '../utils/auth'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../utils/validation'
import { ROUTES } from '../utils/constants'

interface FormErrors {
  email?: string
  password?: string
  general?: string[]
}

export default function Login() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (user) {
      router.push('/explore')
    }
  }, [user, router])

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {}

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      await signInUser(formData.email, formData.password)
      router.push('/explore')
    } catch (error: any) {
      console.error('Login error:', error)
      setErrors({
        general: [error.message || 'Failed to sign in. Please check your credentials and try again.']
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const benefits = [
    {
      icon: Heart,
      text: "Authentic local experiences"
    },
    {
      icon: Users,
      text: "Vetted local experts"
    },
    {
      icon: Globe,
      text: "50+ cities worldwide"
    }
  ]

  return (
    <>
      <Head>
        <title>Sign In - LocalGuide</title>
        <meta name="description" content="Sign in to your LocalGuide account and start connecting with local experts around the world." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-warm flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Branding & Benefits */}
              <div className="hidden lg:block">
                <div className="text-center lg:text-left">
                  <Link href="/" className="inline-block mb-8 group">
                    <div className="text-4xl font-display font-bold text-gradient group-hover:scale-105 transition-transform">
                      LocalGuide
                    </div>
                  </Link>
                  
                  <h1 className="text-5xl font-display font-bold text-neutral-900 mb-6 leading-tight">
                    Welcome back to your next
                    <span className="block text-gradient">adventure</span>
                  </h1>
                  
                  <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
                    Sign in to continue connecting with local experts and discovering authentic travel experiences.
                  </p>

                  <div className="space-y-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-4 animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center">
                          <benefit.icon className="w-6 h-6 text-primary-600" />
                        </div>
                        <span className="text-lg font-medium text-neutral-700">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Login Form */}
              <div className="w-full max-w-lg mx-auto lg:mx-0">
                <Card variant="glass" shadow="2xl" className="border border-white/20">
                  {/* Mobile Header */}
                  <div className="lg:hidden text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                      <div className="text-3xl font-display font-bold text-gradient">
                        LocalGuide
                      </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome back!</h1>
                    <p className="text-neutral-600">Sign in to your account to continue</p>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden lg:block text-center mb-8">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">Sign In</h2>
                    <p className="text-neutral-600">Enter your credentials to access your account</p>
                  </div>

                  {/* Error Messages */}
                  {errors.general && errors.general.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          {errors.general.map((error, index) => (
                            <p key={index} className="text-sm text-red-800 font-medium">{error}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`input input-lg w-full pl-12 ${
                            errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                          }`}
                          placeholder="Enter your email address"
                          required
                          disabled={loading}
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`input input-lg w-full pl-12 pr-12 ${
                            errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                          }`}
                          placeholder="Enter your password"
                          required
                          disabled={loading}
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <Link 
                        href="/forgot-password"
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={loading}
                      className="shadow-lg hover:shadow-xl group"
                    >
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>

                  {/* Sign Up Link */}
                  <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
                    <p className="text-neutral-600">
                      Don't have an account?{' '}
                      <Link 
                        href={ROUTES.JOIN}
                        className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Join LocalGuide
                      </Link>
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-neutral-500">
                      By signing in, you agree to our{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-700 transition-colors">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}