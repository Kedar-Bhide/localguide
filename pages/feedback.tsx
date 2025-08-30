import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { validateEmail, validateName } from '../utils/validation'

interface FormData {
  name: string
  email: string
  comment: string
}

export default function Feedback() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): string[] => {
    const newErrors: string[] = []

    if (!validateName(formData.name.trim())) {
      newErrors.push('Name must be at least 2 characters')
    }

    if (!validateEmail(formData.email.trim())) {
      newErrors.push('Please enter a valid email address')
    }

    if (formData.comment.trim().length < 10) {
      newErrors.push('Comment must be at least 10 characters')
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          comment: formData.comment.trim()
        })

      if (error) {
        throw error
      }

      setShowSuccessModal(true)
    } catch (error: any) {
      setErrors([error.message || 'An error occurred while submitting feedback'])
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Feedback - LocalGuide</title>
        <meta name="description" content="Share your feedback to help us improve LocalGuide" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Share Your Feedback</h1>
          
          <Card>
            <div className="mb-6">
              <p className="text-gray-600 text-center">
                We'd love to hear your thoughts, suggestions, or report any issues you've encountered.
              </p>
            </div>

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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Comment *
                </label>
                <textarea
                  id="comment"
                  rows={5}
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Share your thoughts, suggestions, or report any issues..."
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 10 characters ({formData.comment.length}/10)
                </p>
              </div>

              <Button 
                type="submit" 
                loading={loading}
                className="w-full"
                size="lg"
              >
                Submit Feedback
              </Button>
            </form>
          </Card>
        </div>
      </Layout>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. We appreciate you taking the time to help us improve LocalGuide!
              </p>
              <Button 
                onClick={handleBackToHome}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}