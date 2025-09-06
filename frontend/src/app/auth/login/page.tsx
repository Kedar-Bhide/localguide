'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MapPin, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth'
import type { LoginData } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, loading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginData>()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data)
      router.push('/')
    } catch (error: any) {
      // Error is handled by the toast in the auth store
      console.error('Login error:', error)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-semibold text-gradient">
                LocalGuide
              </span>
            </Link>
            
            <h2 className="text-3xl font-bold text-neutral-900">
              Welcome back!
            </h2>
            <p className="mt-2 text-neutral-600">
              Sign in to continue your journey with local experts
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                type="email"
                label="Email address"
                placeholder="Enter your email"
                leftIcon={<Mail className="h-5 w-5" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
            </div>

            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/auth/forgot-password" 
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full group"
              size="lg"
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="text-center">
              <span className="text-neutral-600">Don't have an account? </span>
              <Link 
                href="/auth/signup" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </form>

        </motion.div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="hidden lg:block relative flex-1">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20" />
          
          <div className="relative h-full flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center text-white"
            >
              <h3 className="text-4xl font-display font-bold mb-6">
                Discover Authentic Experiences
              </h3>
              <p className="text-xl opacity-90 max-w-lg mx-auto leading-relaxed">
                Connect with passionate local experts who will show you the hidden gems 
                and authentic culture of their cities.
              </p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-12 grid grid-cols-2 gap-6 max-w-sm mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm opacity-80">Local Experts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm opacity-80">Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm opacity-80">Travelers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">4.9★</div>
                  <div className="text-sm opacity-80">Rating</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}