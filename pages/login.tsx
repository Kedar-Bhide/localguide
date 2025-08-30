import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { signInUser } from '../utils/auth'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../utils/validation'

export default function Login() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      router.push('/explore')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    const newErrors: string[] = []

    if (!validateEmail(formData.email)) {
      newErrors.push('Please enter a valid email address')
    }

    if (!formData.password) {
      newErrors.push('Password is required')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      await signInUser(formData.email, formData.password)
      router.push('/explore')
    } catch (error: any) {
      let errorMessage = 'An error occurred during login'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before logging in'
      }
      
      setErrors([errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome back</h1>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-center">Sign in to your account</h2>
          
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
              Don't have an account?{' '}
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