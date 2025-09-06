'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  MapPin, Mail, User, ArrowRight, Eye, EyeOff, CheckCircle, 
  Luggage, Home, Globe, Tag, Heart, ArrowLeft, ChevronLeft 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth'
import type { SignupData } from '@/types'

const popularTags = [
  'Food & Drinks', 'Nightlife', 'Culture', 'History', 'Art', 'Museums',
  'Shopping', 'Nature', 'Adventure', 'Photography', 'Local Secrets', 'Hidden Gems',
  'Architecture', 'Music', 'Sports', 'Coffee', 'Markets', 'Street Food'
]

export default function SignupPage() {
  const router = useRouter()
  const { signup, user, loading } = useAuthStore()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'traveler' | 'local' | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<SignupData>()

  const watchedPassword = watch('password', '')
  const watchedFullName = watch('full_name', '')
  const watchedEmail = watch('email', '')
  const watchedCity = watch('city', '')
  const watchedBio = watch('bio', '')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleUserTypeSelect = (userType: 'traveler' | 'local') => {
    setSelectedUserType(userType)
    setValue('user_type', userType)
    setStep(2)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)
    setValue('tags', newTags)
  }

  const nextStep = () => {
    if (step === 2 && (!watchedFullName || !watchedEmail || !watchedPassword)) {
      toast.error('Please fill in all required fields')
      return
    }
    if (step === 3 && selectedUserType === 'local' && (!watchedCity || !watchedBio || selectedTags.length === 0)) {
      toast.error('Please complete your local expert profile')
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const onSubmit = async (data: SignupData) => {
    if (!selectedUserType) {
      toast.error('Please select how you want to use LocalGuide')
      return
    }

    const signupData: SignupData = {
      ...data,
      user_type: selectedUserType,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    }

    try {
      await signup(signupData)
      router.push('/')
    } catch (error: any) {
      console.error('Signup error:', error)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-soft p-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-semibold text-gradient">
              LocalGuide
            </span>
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 rounded-full transition-colors ${
                stepNumber <= step 
                  ? 'bg-primary-500' 
                  : stepNumber === step + 1 && step < 3 
                    ? 'bg-primary-200' 
                    : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-neutral-900">
                    Join LocalGuide
                  </h2>
                  <p className="mt-2 text-neutral-600">
                    How do you want to use LocalGuide?
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Traveler Option */}
                  <button
                    type="button"
                    onClick={() => handleUserTypeSelect('traveler')}
                    className="w-full p-6 border-2 border-neutral-200 rounded-2xl hover:border-primary-300 hover:bg-primary-50 transition-all group text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                        <Luggage className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          I'm a Traveler
                        </h3>
                        <p className="text-sm text-neutral-600">
                          I want to explore places and connect with local experts for authentic experiences
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Local Expert Option */}
                  <button
                    type="button"
                    onClick={() => handleUserTypeSelect('local')}
                    className="w-full p-6 border-2 border-neutral-200 rounded-2xl hover:border-secondary-300 hover:bg-secondary-50 transition-all group text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                        <Home className="w-6 h-6 text-secondary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          I'm a Local Expert
                        </h3>
                        <p className="text-sm text-neutral-600">
                          I want to share my city with travelers and help them discover authentic local experiences
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="text-center text-sm text-neutral-500">
                  <span>Already have an account? </span>
                  <Link 
                    href="/auth/login" 
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-neutral-900">
                    Create your account
                  </h2>
                  <p className="mt-2 text-neutral-600">
                    {selectedUserType === 'traveler' ? 
                      'Tell us about yourself' : 
                      'Let\'s start with the basics'
                    }
                  </p>
                </div>

                <div className="space-y-4">
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
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                  
                  {selectedUserType === 'traveler' ? (
                    <Button
                      type="submit"
                      className="flex-1 group"
                      loading={isSubmitting || loading}
                      disabled={isSubmitting || loading}
                    >
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 group"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Local Expert Details */}
            {step === 3 && selectedUserType === 'local' && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-neutral-900">
                    Tell us about your city
                  </h2>
                  <p className="mt-2 text-neutral-600">
                    Help travelers discover what makes your city special
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      label="Your city"
                      placeholder="e.g. San Francisco, Tokyo, London"
                      leftIcon={<Globe className="h-5 w-5" />}
                      error={errors.city?.message}
                      {...register('city', {
                        required: 'City is required for local experts'
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      What do you love about your city? *
                    </label>
                    <textarea
                      placeholder="Share what makes your city special and what you'd love to show travelers..."
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={4}
                      {...register('bio', {
                        required: 'Please tell us about your city',
                        minLength: {
                          value: 20,
                          message: 'Please write at least 20 characters'
                        }
                      })}
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Your interests & specialties *
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {popularTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                            selectedTags.includes(tag)
                              ? 'bg-primary-500 text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Select {selectedTags.length}/3+ interests that match what you can share with travelers
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1 group"
                    loading={isSubmitting || loading}
                    disabled={isSubmitting || loading}
                  >
                    Create Account
                    <CheckCircle className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  )
}