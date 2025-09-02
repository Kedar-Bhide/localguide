import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { TextField } from '../components/forms'
import { useToast } from '../components/ui/UIProvider'
import { signInUser } from '../utils/auth'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../utils/validation'

interface FormErrors {
  email?: string
  password?: string
  general?: string[]
}

export default function Login() {
  const router = useRouter()
  const toast = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
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
      toast.success('Welcome back!', {
        description: 'You have successfully signed in.',
        duration: 3000
      })
      router.push('/explore')
    } catch (error: any) {
      let errorMessage = 'An error occurred during login'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before logging in'
      }
      
      toast.error('Sign in failed', {
        description: errorMessage,
        duration: 5000
      })
      setErrors({ general: [errorMessage] })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome back</h1>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-center">Sign in to your account</h2>
          
          {errors.general && errors.general.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <ul className="space-y-1">
                {errors.general.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              error={errors.email}
              required
              disabled={loading}
              state={loading ? 'loading' : 'default'}
            />

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
              required
              disabled={loading}
              state={loading ? 'loading' : 'default'}
            />

            <Button 
              type="submit" 
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/join')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}