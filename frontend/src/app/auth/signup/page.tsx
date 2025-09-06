'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MapPin, Mail, User, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth'
import type { SignupData } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const { signup, user, loading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SignupData>()

  const watchedPassword = watch('password', '')
  const watchedFullName = watch('full_name', '')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const onSubmit = async (data: SignupData) => {
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    try {
      await signup(data)
      router.push('/')
    } catch (error: any) {
      // Error is handled by the toast in the auth store
      console.error('Signup error:', error)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' }
    if (password.length < 6) return { strength: 1, label: 'Weak' }
    if (password.length < 8) return { strength: 2, label: 'Fair' }
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 4, label: 'Strong' }
    }
    if (password.length >= 8) return { strength: 3, label: 'Good' }
    return { strength: 1, label: 'Weak' }
  }

  const passwordStrength = getPasswordStrength(watchedPassword)

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-soft p-8"
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
            Create your account
          </h2>
          <p className="mt-2 text-neutral-600">
            Join LocalGuide today
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              type="text"
              label="Full name"
              placeholder="Enter your full name"
              leftIcon={<User className="h-5 w-5" />}
              error={errors.full_name?.message}
              {...register('full_name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'Name cannot exceed 50 characters'
                }
              })}
            />
          </div>

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
              placeholder="Create a secure password"
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

          <Button
            type="submit"
            className="w-full group"
            size="lg"
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Creating account...' : 'Create account'}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="text-center">
            <span className="text-neutral-600">Already have an account? </span>
            <Link 
              href="/auth/login" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}