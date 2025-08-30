import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { signUpUser } from '../utils/auth'
import { validateEmail, validatePassword, validateName } from '../utils/validation'

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
      setErrors([error.message || 'An error occurred during signup'])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Join as a Local</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* How it works card */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">How it works (local)</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-2">1.</span>
                Create your local guide profile and showcase your expertise
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-2">2.</span>
                Connect with travelers visiting your city
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-2">3.</span>
                Share your local knowledge and earn income
              </li>
            </ul>
          </Card>

          {/* Signup form card */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Create your account</h2>
            
            {message && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {message}
              </div>
            )}

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
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <Button 
                type="submit" 
                loading={loading}
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-4 text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Log in
              </button>
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  )
}