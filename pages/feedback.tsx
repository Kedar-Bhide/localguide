import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { TextField, TextArea } from '../components/forms'
import { useToast } from '../components/ui/UIProvider'
import { supabase } from '../lib/supabase'
import { validateEmail, validateName } from '../utils/validation'

interface FormData {
  name: string
  email: string
  comment: string
}

interface FormErrors {
  name?: string
  email?: string
  comment?: string
  general?: string[]
}

export default function Feedback() {
  const router = useRouter()
  const toast = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {}

    if (!validateName(formData.name.trim())) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters'
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

      toast.success('Feedback submitted successfully!', {
        description: 'Thank you for helping us improve LocalGuide.',
        duration: 4000
      })

      // Reset form
      setFormData({ name: '', email: '', comment: '' })
      
    } catch (error: any) {
      toast.error('Failed to submit feedback', {
        description: error.message || 'An error occurred while submitting feedback. Please try again.',
        duration: 6000
      })
      setErrors({ general: [error.message || 'An error occurred while submitting feedback'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Head>
        <title>Feedback - LocalGuide</title>
        <meta name="description" content="Share your feedback to help us improve LocalGuide" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-center mb-8">Share Your Feedback</h1>
          
          <Card>
            <div className="mb-6">
              <p className="text-neutral-600 text-center">
                We&apos;d love to hear your thoughts, suggestions, or report any issues you&apos;ve encountered.
              </p>
            </div>

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
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                error={errors.name}
                required
                disabled={loading}
                state={loading ? 'loading' : 'default'}
              />

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

              <TextArea
                label="Comment"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Share your thoughts, suggestions, or report any issues..."
                description={`Minimum 10 characters (${formData.comment.length}/10)`}
                error={errors.comment}
                required
                disabled={loading}
                minRows={4}
                maxRows={8}
                state={loading ? 'loading' : 'default'}
              />

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
    </div>
  )
}